import { Link } from 'react-router-dom';

const posterImage = '/api/uploads/Fund/main.png';

const voucherCards = [
  {
    id: 'silver',
    title: 'Special Silver - 500',
    image: '/api/uploads/Fund/sliver.webp',
    accent: 'from-violet-700 to-fuchsia-600',
  },
  {
    id: 'gold',
    title: 'Special Gold - 750',
    image: '/api/uploads/Fund/gold.webp',
    accent: 'from-cyan-700 to-teal-500',
  },
  {
    id: 'platinum',
    title: 'Special Platinum - 1000',
    image: '/api/uploads/Fund/platinum.webp',
    accent: 'from-rose-700 to-red-500',
  },
  {
    id: 'diamond',
    title: 'Special Diamond - 1250',
    image: '/api/uploads/Fund/diamond.webp',
    accent: 'from-amber-800 to-orange-600',
  },
];



const DiwaliFund = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <section className="bg-gradient-primary py-10 shadow-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Diwali Fund 🧨🎆 </h1>
          <p className="mt-2 text-primary-100 text-sm md:text-base">
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-primary-200 blur-3xl" />
          <div className="absolute top-10 right-0 h-64 w-64 rounded-full bg-secondary-200 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-card border border-primary-100">
            <img
              src={posterImage}
              alt="Diwali Fund Scheme"
              className="w-full rounded-xl border border-primary-100"
              loading="lazy"
            />
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <p className="text-gray-700 text-lg">
              Choose your fund pack and reserve it early for a smooth Diwali purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {voucherCards.map((card) => (
              <article
                key={card.id}
                className="group bg-white rounded-2xl border border-primary-100 overflow-hidden shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-[460px] object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 bg-white">
                  <h3 className="text-2xl font-bold text-primary-700 min-h-[72px]">{card.title}</h3>
                  <button
                    type="button"
                    className={`mt-3 w-full rounded-xl py-3 text-white font-semibold bg-gradient-to-r ${card.accent} transition-transform duration-300 group-hover:scale-[1.02]`}
                  >
                    Book Now
                  </button>
                </div>
              </article>
            ))}
          </div>



          <div className="text-center pb-4">
            <Link to="/products" className="btn-primary">
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiwaliFund;
