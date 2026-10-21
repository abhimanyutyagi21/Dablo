export const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'X', 'LinkedIn', 'Twitch', 'Newsletter', 'Blog', 'Podcast', 'Other']
export const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD']

// Field: [key, label, type, required, options]
export const definitions = {
  content: { label: 'Content', singular: 'content item', icon: '▤', fields: [
    ['title', 'Title', 'text', true], ['url', 'Content URL', 'url'], ['platform', 'Platform', 'select', true, PLATFORMS],
    ['format', 'Format', 'select', false, ['Video', 'Short-form video', 'Post', 'Newsletter', 'Article', 'Podcast', 'Other']],
    ['published', 'Published on', 'date'], ['views', 'Views', 'number'], ['clicks', 'Qualified clicks', 'number'],
    ['conversions', 'Conversions', 'number'], ['revenue', 'Attributed revenue', 'number'], ['campaign', 'Campaign', 'text'],
    ['product', 'Product / offer', 'text'], ['tags', 'Tags (comma separated)', 'text'], ['notes', 'Notes', 'textarea']] },
  revenue: { label: 'Revenue', singular: 'revenue record', icon: '↗', fields: [
    ['title', 'Record name', 'text', true], ['amount', 'Amount', 'number', true], ['currency', 'Currency', 'select', true, CURRENCIES],
    ['date', 'Date', 'date', true], ['source', 'Source', 'select', true, ['Affiliate', 'Sponsorship', 'Digital product', 'Services', 'Platform payout', 'Other']],
    ['platform', 'Platform', 'select', false, ['Unassigned', ...PLATFORMS]], ['product', 'Product / offer', 'text'], ['campaign', 'Campaign', 'text'],
    ['content', 'Content item', 'text'], ['link', 'Tracking link slug', 'text'],
    ['conversionType', 'Conversion type', 'select', false, ['Purchase', 'Lead', 'Subscription', 'Sponsorship payment', 'Payout', 'Other']],
    ['attribution', 'Attribution status', 'select', true, ['Attributed', 'Manually associated', 'Unattributed', 'Estimated']],
    ['reference', 'Transaction reference', 'text'], ['notes', 'Notes', 'textarea']] },
  links: { label: 'Tracking links', singular: 'tracking link', icon: '⌁', fields: [
    ['name', 'Link name', 'text', true], ['destination', 'Destination URL', 'url', true], ['slug', 'Custom slug (optional)', 'text'],
    ['content', 'Content item', 'text'], ['campaign', 'Campaign', 'text'], ['product', 'Product / offer', 'text'],
    ['source', 'Source parameter', 'text'], ['medium', 'Medium parameter', 'text'], ['status', 'Status', 'select', true, ['Active', 'Paused']],
    ['conversions', 'Conversions', 'number'], ['revenue', 'Attributed revenue', 'number']] },
  campaigns: { label: 'Campaigns', singular: 'campaign', icon: '◉', fields: [
    ['name', 'Campaign name', 'text', true], ['description', 'Description', 'textarea'], ['start', 'Start date', 'date'], ['end', 'End date', 'date'],
    ['status', 'Status', 'select', true, ['Planning', 'Active', 'Completed', 'Archived']], ['products', 'Products / offers', 'text'],
    ['content', 'Content items', 'text'], ['links', 'Tracking links', 'text'], ['budget', 'Budget', 'number'], ['notes', 'Notes', 'textarea']] },
  products: { label: 'Products & offers', singular: 'product or offer', icon: '◇', fields: [
    ['name', 'Product / offer name', 'text', true],
    ['type', 'Type', 'select', true, ['Digital product', 'Affiliate offer', 'Service', 'Sponsorship', 'Physical product', 'Subscription', 'Other']],
    ['url', 'Product URL', 'url'], ['price', 'Price', 'number'], ['currency', 'Currency', 'select', true, CURRENCIES],
    ['status', 'Status', 'select', true, ['Active', 'Draft', 'Archived']], ['description', 'Description', 'textarea'], ['notes', 'Notes', 'textarea']] },
  frameworks: { label: 'Frameworks', singular: 'framework', icon: '▧', fields: [
    ['name', 'Framework name', 'text', true], ['topic', 'Topic / pattern', 'text'], ['hook', 'Hook', 'textarea'],
    ['structure', 'Structure / steps', 'textarea', true], ['cta', 'Call to action', 'text'], ['evidence', 'Evidence / source', 'text'],
    ['status', 'Status', 'select', true, ['Draft', 'Testing', 'Proven pattern']], ['notes', 'Notes', 'textarea']] },
}

export const COLUMNS = {
  content: [['title', 'Content'], ['platform', 'Platform'], ['published', 'Published'], ['views', 'Views'], ['clicks', 'Clicks'], ['revenue', 'Attributed revenue']],
  revenue: [['title', 'Record'], ['date', 'Date'], ['source', 'Source'], ['attribution', 'Attribution'], ['amount', 'Amount']],
  links: [['name', 'Link'], ['slug', 'Short link'], ['status', 'Status'], ['clicks', 'Tracked clicks'], ['conversions', 'Conversions'], ['revenue', 'Attributed revenue']],
  campaigns: [['name', 'Campaign'], ['status', 'Status'], ['start', 'Start'], ['end', 'End'], ['budget', 'Budget']],
}

export const FILTERS = {
  content: PLATFORMS, revenue: ['Attributed', 'Manually associated', 'Unattributed', 'Estimated'],
  campaigns: ['Planning', 'Active', 'Completed', 'Archived'], links: ['Active', 'Paused'],
}

export const DESCRIPTIONS = {
  content: 'Keep every post connected to its commercial context.',
  revenue: 'Record income once, then connect it to content and campaigns without double-counting.',
  links: 'Share the short link. Each real click is counted, then visitors are sent to your destination with campaign parameters added.',
  campaigns: 'Group content, links, offers and costs around a shared goal.',
}

export const PAGE_TITLES = {
  overview: 'Overview', content: 'Content', revenue: 'Revenue', platforms: 'Platforms & earnings', links: 'Tracking links',
  campaigns: 'Campaigns', insights: 'Insights', frameworks: 'Frameworks', products: 'Products & offers', reports: 'Reports', settings: 'Settings',
}
