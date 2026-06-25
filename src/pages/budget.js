import React, { useState, useEffect } from "react"
import styled, { createGlobalStyle } from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faPlus } from "@fortawesome/free-solid-svg-icons"
import "@fontsource/montserrat/900.css"
import "@fontsource/courier-prime"

const bg = "#F6F1EB"
const ink = "#18140E"
const pink = "#C4503A"
const yellow = "#B8913C"
const muted = "rgba(24,20,14,0.28)"
const mutedBg = "rgba(24,20,14,0.06)"

const Global = createGlobalStyle`
  html, body { background: ${bg}; margin: 0; }
  * { box-sizing: border-box; }
`

const Page = styled.div`
  min-height: 100vh;
  background: ${bg};
  color: ${ink};
  padding: clamp(2rem, 6vw, 5rem) clamp(1.5rem, 7vw, 7rem);
  font-family: "Courier Prime", Courier, monospace;
`

const Header = styled.div`
  margin-bottom: 3rem;
`

const Title = styled.h1`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(2.5rem, 8vw, 6rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  margin: 0 0 0.5rem;
`

const BackLink = styled.a`
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${muted};
  text-decoration: none;
  display: inline-block;
  margin-bottom: 2rem;
  transition: color 0.2s;
  &:hover { color: ${pink}; }
  &::before { content: "← "; }
`

const Accent = styled.div`
  width: 44px;
  height: 2px;
  background: ${pink};
  margin-bottom: 18px;
`

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
`

const Card = styled.div`
  background: ${({ $highlight }) => ($highlight ? pink : mutedBg)};
  color: ${({ $highlight }) => ($highlight ? "#fff" : ink)};
  border-radius: 4px;
  padding: 1.25rem 1.5rem;
`

const CardLabel = styled.div`
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: ${({ $highlight }) => ($highlight ? 0.8 : 0.5)};
  margin-bottom: 6px;
`

const CardAmount = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 900;
  font-size: clamp(1.4rem, 3vw, 2rem);
  letter-spacing: -0.02em;
`

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 2.5rem;
  align-items: start;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

const FormSection = styled.div``

const SectionLabel = styled.div`
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${pink};
  margin-bottom: 1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const Input = styled.input`
  background: ${mutedBg};
  border: 1px solid transparent;
  border-radius: 3px;
  padding: 0.65rem 0.85rem;
  font-family: "Courier Prime", Courier, monospace;
  font-size: 14px;
  color: ${ink};
  width: 100%;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: ${pink}; }
  &::placeholder { color: ${muted}; }
`

const Select = styled.select`
  background: ${mutedBg};
  border: 1px solid transparent;
  border-radius: 3px;
  padding: 0.65rem 0.85rem;
  font-family: "Courier Prime", Courier, monospace;
  font-size: 14px;
  color: ${ink};
  width: 100%;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  &:focus { border-color: ${pink}; }
`

const RadioRow = styled.div`
  display: flex;
  gap: 0.75rem;
`

const RadioLabel = styled.label`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ $active, $type }) =>
    $active ? ($type === "income" ? yellow : pink) : mutedBg};
  color: ${({ $active }) => ($active ? "#fff" : ink)};
  border-radius: 3px;
  padding: 0.6rem;
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  input { display: none; }
`

const AddBtn = styled.button`
  background: ${pink};
  color: #fff;
  border: none;
  border-radius: 3px;
  padding: 0.75rem;
  font-family: "Courier Prime", Courier, monospace;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.4; cursor: default; }
`

const ListSection = styled.div``

const TxList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const TxItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${mutedBg};
  border-radius: 3px;
  padding: 0.75rem 1rem;
`

const TxDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $type }) => ($type === "income" ? yellow : pink)};
`

const TxMeta = styled.div`
  flex: 1;
  min-width: 0;
`

const TxDesc = styled.div`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TxCat = styled.div`
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${muted};
  margin-top: 2px;
`

const TxAmount = styled.div`
  font-family: Montserrat, sans-serif;
  font-weight: 800;
  font-size: 15px;
  color: ${({ $type }) => ($type === "income" ? yellow : pink)};
  white-space: nowrap;
`

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: ${muted};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  font-size: 13px;
  transition: color 0.2s;
  &:hover { color: ${pink}; }
`

const EmptyMsg = styled.p`
  color: ${muted};
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0;
`

const CATEGORIES = [
  "Housing", "Food", "Transport", "Entertainment",
  "Health", "Shopping", "Savings", "Income", "Other",
]

const STORAGE_KEY = "ep_budget_v1"

const fmt = n =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

export default function BudgetPage() {
  const [transactions, setTransactions] = useState([])
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Other")
  const [type, setType] = useState("expense")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setTransactions(JSON.parse(saved))
    } catch (_) {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const handleAdd = e => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!desc.trim() || isNaN(parsed) || parsed <= 0) return
    const tx = {
      id: Date.now(),
      desc: desc.trim(),
      amount: parsed,
      category,
      type,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }
    setTransactions(prev => [tx, ...prev])
    setDesc("")
    setAmount("")
  }

  const handleDelete = id =>
    setTransactions(prev => prev.filter(t => t.id !== id))

  const canAdd = desc.trim() && parseFloat(amount) > 0

  return (
    <>
      <Global />
      <Page>
        <BackLink href="/">home</BackLink>

        <Header>
          <Accent />
          <Title>Budget</Title>
        </Header>

        <Summary>
          <Card>
            <CardLabel>Income</CardLabel>
            <CardAmount style={{ color: yellow }}>{fmt(totalIncome)}</CardAmount>
          </Card>
          <Card>
            <CardLabel>Expenses</CardLabel>
            <CardAmount style={{ color: pink }}>{fmt(totalExpenses)}</CardAmount>
          </Card>
          <Card $highlight={balance < 0}>
            <CardLabel $highlight={balance < 0}>Balance</CardLabel>
            <CardAmount>{fmt(balance)}</CardAmount>
          </Card>
        </Summary>

        <TwoCol>
          <FormSection>
            <SectionLabel>Add transaction</SectionLabel>
            <Form onSubmit={handleAdd}>
              <RadioRow>
                <RadioLabel $active={type === "expense"} $type="expense">
                  <input
                    type="radio"
                    value="expense"
                    checked={type === "expense"}
                    onChange={() => setType("expense")}
                  />
                  Expense
                </RadioLabel>
                <RadioLabel $active={type === "income"} $type="income">
                  <input
                    type="radio"
                    value="income"
                    checked={type === "income"}
                    onChange={() => setType("income")}
                  />
                  Income
                </RadioLabel>
              </RadioRow>

              <Input
                type="text"
                placeholder="Description"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Amount"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />

              <Select value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>

              <AddBtn type="submit" disabled={!canAdd}>
                <FontAwesomeIcon icon={faPlus} />
                Add
              </AddBtn>
            </Form>
          </FormSection>

          <ListSection>
            <SectionLabel>Transactions ({transactions.length})</SectionLabel>
            {transactions.length === 0 ? (
              <EmptyMsg>No transactions yet</EmptyMsg>
            ) : (
              <TxList>
                {transactions.map(tx => (
                  <TxItem key={tx.id}>
                    <TxDot $type={tx.type} />
                    <TxMeta>
                      <TxDesc>{tx.desc}</TxDesc>
                      <TxCat>{tx.category} · {tx.date}</TxCat>
                    </TxMeta>
                    <TxAmount $type={tx.type}>
                      {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                    </TxAmount>
                    <DeleteBtn
                      onClick={() => handleDelete(tx.id)}
                      aria-label="Delete transaction"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </DeleteBtn>
                  </TxItem>
                ))}
              </TxList>
            )}
          </ListSection>
        </TwoCol>
      </Page>
    </>
  )
}

export const Head = () => (
  <>
    <title>Budget — Emily Pillay</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </>
)
