// Initialize Stripe
const stripe = Stripe('your_publishable_key'); // Replace with your Stripe publishable key
let elements;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const bookingId = urlParams.get('booking');
const amount = urlParams.get('amount');

// Display booking details
document.getElementById('bookingId').textContent = bookingId || 'Not provided';
document.getElementById('depositAmount').textContent = amount ? `$${amount}` : 'Not set';

async function initialize() {
    try {
        const response = await fetch("/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                bookingId: bookingId,
                amount: amount 
            }),
        });

        const { clientSecret } = await response.json();

        const appearance = {
            theme: 'night',
            variables: {
                colorPrimary: '#c41e3a',
                colorBackground: '#1a1a1a',
                colorText: '#ffffff',
                colorDanger: '#ff4444',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
        };

        elements = stripe.elements({ appearance, clientSecret });

        const paymentElement = elements.create("payment");
        paymentElement.mount("#payment-element");
    } catch (e) {
        console.error("Error:", e);
        showMessage("Failed to initialize payment. Please try again later.");
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking-confirmation.html`,
            },
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                showMessage(error.message);
            } else {
                showMessage("An unexpected error occurred.");
            }
        }
    } catch (e) {
        console.error("Error:", e);
        showMessage("Payment failed. Please try again.");
    }

    setLoading(false);
}

// UI helpers
function showMessage(messageText) {
    const messageContainer = document.querySelector("#payment-message");
    messageContainer.classList.remove("hidden");
    messageContainer.textContent = messageText;

    setTimeout(function () {
        messageContainer.classList.add("hidden");
        messageContainer.textContent = "";
    }, 4000);
}

function setLoading(isLoading) {
    if (isLoading) {
        document.querySelector("#submit").disabled = true;
        document.querySelector("#spinner").classList.remove("hidden");
        document.querySelector("#button-text").classList.add("hidden");
    } else {
        document.querySelector("#submit").disabled = false;
        document.querySelector("#spinner").classList.add("hidden");
        document.querySelector("#button-text").classList.remove("hidden");
    }
}

// Add event listeners
document.querySelector("#payment-form").addEventListener("submit", handleSubmit);

// Initialize the payment form
initialize();
