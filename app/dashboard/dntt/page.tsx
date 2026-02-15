import { getPaymentRequests } from '@/lib/actions/payment-requests'
import { PaymentRequestContainer } from '@/components/payment-request/payment-request-container'

export default async function DNTTPage() {
    // Fetch initial data (global, no project filter)
    const result = await getPaymentRequests(null, 1, 20)

    return (
        <div className="p-4 h-[calc(100vh-64px)] flex flex-col">
            <PaymentRequestContainer
                initialData={result.data}
                totalCount={result.count}
            />
        </div>
    )
}
