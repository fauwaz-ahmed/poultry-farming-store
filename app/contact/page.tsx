export default function Contact() {
  const phoneNumber = "8516000946";
  const whatsappNumber = "918516000946";

  return (
    <main className="container-farm py-16">
      <div className="max-w-3xl">
        <p className="font-bold uppercase tracking-[0.2em] text-farm-600">
          Get in touch
        </p>

        <h1 className="mt-3 text-4xl font-black">
          Contact us
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Have a question about chickens, poultry feed, medicines, or farm
          equipment? Contact us and we will be happy to help.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <a
            href={`tel:${phoneNumber}`}
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-4xl">📞</div>

            <h2 className="mt-4 text-xl font-bold">
              Call us
            </h2>

            <p className="mt-2 text-gray-600">
              Speak directly with our team.
            </p>

            <p className="mt-4 font-bold text-farm-700">
              {phoneNumber}
            </p>
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-4xl">💬</div>

            <h2 className="mt-4 text-xl font-bold">
              WhatsApp
            </h2>

            <p className="mt-2 text-gray-600">
              Message us directly on WhatsApp.
            </p>

            <p className="mt-4 font-bold text-farm-700">
              Chat on WhatsApp
            </p>
          </a>
        </div>

        <div className="mt-8 rounded-2xl bg-gray-50 p-6">
          <h2 className="text-xl font-bold">
            Customer support
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            For order questions, product information, delivery queries, or
            general support, please contact us using the phone number or
            WhatsApp option above.
          </p>
        </div>
      </div>
    </main>
  );
}
