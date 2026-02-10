const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://osscplmlycffgiorcmba.supabase.co'
const supabaseKey = 'sb_publishable_-TmME_acQbonbqrRp4u6kg_DZuI0TFN'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Fetching transactions...')
supabase.from('transactions').select('*').then(({ data, error }) => {
    if (error) {
        console.error('Error fetching transactions:', error)
    } else {
        console.log(`Found ${data.length} transactions:`)
        data.forEach(t => {
            console.log(`- [${t.id}] ${t.date} Type: ${t.type} Cat: ${t.category} Desc: ${t.description} Amount: ${t.amount}`)
        })
    }
}).catch(err => console.error('Unexpected error:', err))
