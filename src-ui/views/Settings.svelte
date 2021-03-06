<script>
    import cc from 'currency-codes'

    import { Export, Button, Dropdown, Footer, Header, Icon, Tabs, Toggle, View, Warning } from '~/components'
    import { account, seed } from '~/lib/account'
    import { marketData } from '~/lib/market'
    import { darkMode, fiatCurrency, showNotifications } from '~/lib/app'

    let showWarning = false
    let showExport = false

    $: currencies = getCurrencies($marketData.rates)

    let disabledNotifications = typeof Notification !== 'function' || Notification.permission === 'denied'

    const getCurrencies = ($rates) => {
        if (!$rates) {
            return []
        }
        const result = Object.keys($rates).map((item) => {
            const currencyData = cc.code(item)
            return {
                label: currencyData.currency,
                flag: currencyData.countries[0],
                value: item
            }
        })
        result.sort((a, b) => (a.label > b.label ? 1 : -1))
        return result
    }

    const changeCurrency = (currency) => {
        fiatCurrency.set(currency)
    }

    const destroyWallet = async () => {
        try {
            const { generatePersistenceID } = await import('@iota/persistence')
            const { trytesToTrits } = await import('@iota/converter')

            const dbID = generatePersistenceID(trytesToTrits($seed))

            if ($account) {
                $account.stop()
            }

            const deleteRequest = window.indexedDB.deleteDatabase(dbID)

            deleteRequest.onsuccess = () => {
                localStorage.clear()
                sessionStorage.clear()
                location.hash = ''
                location.reload()
            }
        } catch (err) {
            console.log(err)
        }
    }

    let tabs = ['Basic', 'Wallet']
    let tab = 'Basic'
</script>

<style>
    main {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    section {
        flex: 1;
        padding: 28px 20px;
    }

    hr {
        display: block;
        width: calc(100% + 40px);
        height: 1px;
        margin: 0 0 20px -20px;
        background: var(--hr);
    }

    p + hr {
        margin-top: 20px;
    }

    label.inline {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    main > p {
        font-size: 12px;
        margin-bottom: 24px;
    }

    article {
        display: flex;
        padding: 12px 15px 24px;
    }

    article icon {
        width: 110px;
        text-align: center;
    }

    article div {
        padding-left: 28px;
    }

    article p {
        font-size: 12px;
        line-height: 18px;
    }
    h5 {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 22px;
    }
    p {
        line-height: 18px;
    }

    h6.dark {
        color: var(--fg);
    }
</style>

<Warning bind:active={showWarning} onConfirm={destroyWallet}>
    <h5>Destroy wallet?</h5>
    <p>
        Your transaction history will be cleared. If you have not backed up, you will permanently lose the tokens in your wallet.
    </p>
</Warning>

<Export bind:active={showExport} />

<View label="Settings" secondary>
    <Tabs {tabs} bind:tab />
    <main>
        {#if tab === 'Basic'}
            <section>
                <label>Language</label>
                <Dropdown value="English" flag="United Kingdom" disabled />

                <label>Currency</label>
                <Dropdown
                    onSelect={changeCurrency}
                    flag={cc.code($fiatCurrency).countries[0]}
                    value={cc.code($fiatCurrency).currency}
                    items={currencies} />
                <hr />

                <label class="inline">
                    <span>Dark mode</span>
                    <span>
                        <Toggle on={darkMode} />
                    </span>
                </label>
                <p>Visual theme optimised for night time use</p>
                <hr />
                <label class="inline">
                    <span>Notifications</span>
                    <span>
                        <Toggle disabled={disabledNotifications} on={showNotifications} />
                    </span>
                </label>
                {#if disabledNotifications}
                    <p>Notifications are blocked by your browser. Enable them in the browser settings and restart Spark.</p>
                {:else}
                    <p>Show new and confirmed payment notifications</p>
                {/if}
                <hr />
            </section>
        {/if}
        {#if tab === 'Advanced'}
            <section>
                <label>Set node</label>
                <input type="text" value="https://wallet2.iota.town:443" />
            </section>
        {/if}
        {#if tab === 'Wallet'}
            <section>
                <article>
                    <icon>
                        <Icon icon="seedvault" />
                    </icon>
                    <div>
                        <h6 class="dark">BACK UP WITH SEEDVAULT</h6>
                        <p>
                            You can backup this wallet by exporting a seedvault. The exported SeedVault can then be imported into
                            Trinity wallet.
                        </p>

                    </div>
                </article>
                <Button
                    onClick={() => {
                        showExport = true
                    }}
                    label="Create SeedVault" />
            </section>
            <Footer tooltip>
                <article>
                    <icon>
                        <Icon icon="warning" warning />
                    </icon>
                    <div>
                        <h6>BURN YOUR WALLET</h6>
                        <p>
                            You can destroy this wallet, but you will lose access to your tokens and transaction history.
                            <br />
                            Be sure to back up your wallet before proceeding, otherwise your tokens will be unrecoverable.
                        </p>
                    </div>
                </article>
                <Button
                    onClick={() => {
                        showWarning = true
                    }}
                    warning
                    label="Destroy this wallet" />
            </Footer>
        {/if}
    </main>
</View>
