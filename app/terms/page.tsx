export default function Terms() {
  return (
    <main className="container-farm py-16">
      <h1 className="text-4xl font-black">
        Terms &amp; Conditions
      </h1>

      <p className="mt-4 max-w-3xl leading-7 text-gray-600">
        By using this website and placing an order, you agree to the terms
        described below.
      </p>

      <div className="mt-8 max-w-3xl space-y-6">
        <section>
          <h2 className="text-xl font-bold">
            Accounts
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Customers must provide accurate information when creating an
            account. Customers are responsible for keeping their account
            credentials secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Orders
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Orders are subject to product availability and confirmation.
            Product prices, stock availability, and order details are
            validated by the server before an order is created.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Cash on Delivery
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Orders currently use Cash on Delivery. Payment is collected when
            the order is delivered according to the applicable delivery
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Cancellation
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Customers may cancel an order while it is in the Pending status,
            subject to the store's order and delivery policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Product information
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Product descriptions, prices, availability, and images may
            change without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Contact
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            For questions about an order or these terms, please contact us
            through the Contact page.
          </p>
        </section>
      </div>
    </main>
  );
}