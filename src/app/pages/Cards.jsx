import { CreateButton, Empty, Heading, useUI } from '../components/common'
import { useStore } from '../store'
import { sumBy } from '../utils'

export function Products() {
  const { data, money, deleteRecord } = useStore()
  const { openForm } = useUI()
  const xs = data.collections.products
  return (<>
    <Heading title="Products & offers" desc="See the offers connected to your content and recorded revenue."><CreateButton type="products" label="Add product" /></Heading>
    {xs.length ? (
      <div className="product-grid">{xs.map((p) => {
        const rs = data.collections.revenue.filter((r) => r.product === p.name)
        return (
          <article key={p.id} className="product-card">
            <div className="card-topline"><span className="card-symbol">◇</span><span className="status-pill">{p.status || 'Active'}</span></div>
            <h3>{p.name}</h3><p>{p.description || p.type || 'Offer'}</p>
            <div className="card-meta"><span>{rs.length} revenue records</span><b className="money">{money(sumBy(rs, 'amount'), p.currency)}</b></div>
            <div style={{ display: 'flex', gap: 6, marginTop: 13 }}>
              <button className="button ghost" onClick={() => openForm('products', p)}>Edit</button>
              <button className="button ghost" onClick={() => deleteRecord('products', p.id)}>Delete</button>
            </div>
          </article>)
      })}</div>
    ) : <Empty title="Add your first offer" desc="Products and offers make it easier to understand where revenue is coming from."><CreateButton type="products" label="Add product" /></Empty>}
  </>)
}

export function Frameworks() {
  const { data, deleteRecord } = useStore()
  const { openForm } = useUI()
  const xs = data.collections.frameworks
  return (<>
    <Heading title="Frameworks" desc="A working playbook built from your own observations."><CreateButton type="frameworks" label="Create framework" /></Heading>
    {xs.length ? (
      <div className="framework-grid">{xs.map((f) => (
        <article key={f.id} className="framework-card">
          <div className="card-topline"><span className="card-symbol">▧</span><span className={'status-pill' + (f.status === 'Proven pattern' ? '' : ' warn')}>{f.status || 'Draft'}</span></div>
          <h3>{f.name}</h3><p>{f.topic || f.structure || 'Add a topic and working steps.'}</p>
          <div className="card-meta"><span>{f.evidence || 'No evidence linked'}</span>
            <div><button className="tiny-action" onClick={() => openForm('frameworks', f)}>Edit</button> <button className="tiny-action" onClick={() => deleteRecord('frameworks', f.id)}>×</button></div></div>
        </article>))}</div>
    ) : <Empty title="Your playbook starts with one useful pattern" desc="Save an insight or write a framework manually. Keep hypotheses marked as tests until enough evidence exists."><CreateButton type="frameworks" label="Create framework" /></Empty>}
  </>)
}
