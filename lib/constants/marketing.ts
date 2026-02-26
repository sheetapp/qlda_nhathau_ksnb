/**
 * Marketing Campaign Constants
 * Định nghĩa các hằng số cho hệ thống quản lý chiến dịch marketing
 */

// Campaign Status
export const CAMPAIGN_STATUS = [
    'Draft',
    'Scheduled',
    'Running',
    'Paused',
    'Completed',
    'Archived'
] as const

export type CampaignStatus = typeof CAMPAIGN_STATUS[number]

// Campaign Type
export const CAMPAIGN_TYPES = [
    'Email',
    'SMS',
    'Social',
    'Landing',
    'Multi-channel'
] as const

export type CampaignType = typeof CAMPAIGN_TYPES[number]

// Campaign Objectives
export const CAMPAIGN_OBJECTIVES = [
    'Awareness',
    'Lead Generation',
    'Conversion',
    'Retention',
    'Engagement',
    'Brand Building'
] as const

export type CampaignObjective = typeof CAMPAIGN_OBJECTIVES[number]

// Communication Channels
export const CHANNELS = [
    'Email',
    'SMS',
    'Facebook',
    'Instagram',
    'LinkedIn',
    'TikTok',
    'Twitter',
    'Web',
    'App'
] as const

export type Channel = typeof CHANNELS[number]

// Email Platform
export const EMAIL_PLATFORMS = [
    'Mailchimp',
    'SendGrid',
    'Braze',
    'HubSpot',
    'Custom'
] as const

// SMS Provider
export const SMS_PROVIDERS = [
    'Twilio',
    'Firebase',
    'AWS SNS',
    'Custom'
] as const

// Social Media Platforms
export const SOCIAL_PLATFORMS = [
    'Facebook',
    'Instagram',
    'LinkedIn',
    'TikTok',
    'Twitter',
    'Pinterest'
] as const

type SocialPlatform = typeof SOCIAL_PLATFORMS[number]

// Campaign Status Color Mapping
export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, {
    bg: string
    text: string
    border: string
    icon: string
}> = {
    Draft: {
        bg: 'bg-slate-500/10',
        text: 'text-slate-600',
        border: 'border-slate-500/20',
        icon: '📝'
    },
    Scheduled: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-600',
        border: 'border-blue-500/20',
        icon: '⏰'
    },
    Running: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-600',
        border: 'border-emerald-500/20',
        icon: '🚀'
    },
    Paused: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-600',
        border: 'border-orange-500/20',
        icon: '⏸️'
    },
    Completed: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-600',
        border: 'border-purple-500/20',
        icon: '✅'
    },
    Archived: {
        bg: 'bg-gray-500/10',
        text: 'text-gray-600',
        border: 'border-gray-500/20',
        icon: '📦'
    }
}

// Campaign Type Icons
export const CAMPAIGN_TYPE_ICONS: Record<CampaignType, string> = {
    Email: '📧',
    SMS: '💬',
    Social: '👥',
    Landing: '🎯',
    'Multi-channel': '🔗'
}

// Channel Icons
export const CHANNEL_ICONS: Record<Channel, string> = {
    Email: '📧',
    SMS: '💬',
    Facebook: '👍',
    Instagram: '📸',
    LinkedIn: '💼',
    TikTok: '🎵',
    Twitter: '🐦',
    Web: '🌐',
    App: '📱'
}

// Objective Icons
export const OBJECTIVE_ICONS: Record<CampaignObjective, string> = {
    Awareness: '👁️',
    'Lead Generation': '🎯',
    Conversion: '💰',
    Retention: '🔄',
    Engagement: '💬',
    'Brand Building': '🏢'
}

// Default Campaign Template
export const DEFAULT_CAMPAIGN = {
    campaign_name: '',
    description: '',
    objective: 'Lead Generation' as CampaignObjective,
    channels: ['Email'] as Channel[],
    total_budget: 0,
    spent_amount: 0,
    currency_code: 'VND',
    status: 'Draft' as CampaignStatus,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    target_audience: '{}',
    project_id: ''
}

// Page Size Options
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

// Default Page Size
export const DEFAULT_PAGE_SIZE = 20

// Email Template Types
export const EMAIL_TEMPLATE_TYPES = [
    'Welcome',
    'Newsletter',
    'Promotional',
    'Transactional',
    'Educational',
    'Survey',
    'Re-engagement'
] as const

// SMS Message Types
export const SMS_MESSAGE_TYPES = [
    'Promotional',
    'Transactional',
    'Authentication',
    'Reminder',
    'Review Request'
] as const

// Social Post Types
export const SOCIAL_POST_TYPES = [
    'Text',
    'Image',
    'Video',
    'Carousel',
    'Story',
    'Reel'
] as const

// Currency Codes
export const CURRENCY_CODES = [
    'VND',
    'USD',
    'EUR',
    'GBP',
    'JPY'
] as const

// Metric Types
export const METRIC_TYPES = {
    impressions: 'Impressions',
    clicks: 'Clicks',
    conversions: 'Conversions',
    opens: 'Opens (Email)',
    click_through_rate: 'CTR',
    conversion_rate: 'Conversion Rate',
    cost_per_click: 'CPC',
    cost_per_conversion: 'CPA',
    roi: 'ROI',
    revenue: 'Revenue Generated'
} as const

// Time Periods for Reports
export const TIME_PERIODS = [
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Yearly'
] as const

export type TimePeriod = typeof TIME_PERIODS[number]

// Sorting Options
export const SORT_OPTIONS = [
    { value: 'name', label: 'Tên (A-Z)' },
    { value: '-name', label: 'Tên (Z-A)' },
    { value: 'start_date', label: 'Ngày bắt đầu (Cũ nhất)' },
    { value: '-start_date', label: 'Ngày bắt đầu (Mới nhất)' },
    { value: 'budget', label: 'Ngân sách (Thấp nhất)' },
    { value: '-budget', label: 'Ngân sách (Cao nhất)' },
    { value: 'status', label: 'Trạng thái' }
] as const
