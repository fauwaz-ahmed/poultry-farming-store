export default function Privacy() {
  return (
    <main className="container-farm py-16">
      <h1 className="text-4xl font-black">
        Privacy Policy
      </h1>

      <p className="mt-4 max-w-3xl leading-7 text-gray-600">
        We respect your privacy and handle your personal information only
        as needed to provide our services, process orders, communicate with
        customers, and improve the shopping experience.
      </p>

      <div className="mt-8 max-w-3xl space-y-6">
        <section>
          <h2 className="text-xl font-bold">
            Information we collect
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            When you create an account or place an order, we may collect
            information such as your name, phone number, email address,
            delivery address, and order details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            How we use your information
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Your information may be used to create and manage your account,
            process orders, arrange delivery, provide customer support, and
            communicate with you about your orders.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Payment information
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Orders currently use Cash on Delivery. We do not ask customers
            to enter card or online payment credentials on this website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Account security
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            Account passwords are securely hashed and are not stored as
            plain text.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold">
            Contact
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            If you have questions about this privacy policy or your personal
            information, please contact us through the Contact page.
          </p>
        </section>
      </div>
    </main>
  );
}