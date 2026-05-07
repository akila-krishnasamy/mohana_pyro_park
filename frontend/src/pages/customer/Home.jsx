import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Truck, Shield, Gift, Star } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import ProductCard from '../../components/customer/ProductCard';
import { PageLoader, ErrorMessage } from '../../components/common';
import { useState } from 'react';

const Home = () => {
  const { t } = useTranslation('common');
  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getFeatured(),
    select: (res) => res.products,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll(),
    select: (res) => res.categories,
  });

  if (productsLoading || categoriesLoading) return <PageLoader />;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">{t('hero.tagline')}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                {t('hero.title')} <br />
                <span className="text-accent-gold">{t('hero.subtitle')}</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-lg">
                {t('hero.description')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                  {t('hero.shopNow')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products?category=gift-boxes" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
                  {t('hero.viewGiftBoxes')}
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="text-[200px] animate-pulse-soft">🎆</div>
                <div className="absolute top-10 right-10 text-6xl animate-bounce">✨</div>
                <div className="absolute bottom-20 left-0 text-6xl animate-pulse">🎇</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, key: 'delivery' },
              { icon: Shield, key: 'safe' },
              { icon: Gift, key: 'gift' },
              { icon: Star, key: 'prices' },
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{t(`features.${feature.key}.title`)}</h3>
                  <p className="text-sm text-gray-500">{t(`features.${feature.key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('categories.title')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.slice(0, 8).map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="card-hover p-6 text-center group"
              >
                <div className="text-4xl mb-3">
                  {category.name === 'Ground Chakkar' && '🎡'}
                  {category.name === 'Flower Pots' && '🌸'}
                  {category.name === 'Rockets' && '🚀'}
                  {category.name === 'Bombs & Crackers' && '💥'}
                  {category.name === 'Sparklers' && '✨'}
                  {category.name === 'Fancy Items' && '🎆'}
                  {category.name === 'Gift Boxes' && '🎁'}
                  {category.name === 'Sky Shots' && '🎇'}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{t('categories.productCount', { count: category.productCount })}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brands We Handle */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('brands.title')}</h2>
          </div>
          
          {/* Brands Marquee */}
          <div className="relative overflow-hidden">
            <div className="flex gap-16 items-center animate-marquee whitespace-nowrap">
              {[
                { name: 'Success', image: '/images/brands/brand1.png' },
                { name: 'Da Mo', image: '/images/brands/brand2.png' },
                { name: 'Lime Brand', image: '/images/brands/brand3.png' },
                { name: 'Sonny', image: '/images/brands/brand4.png' },
                { name: 'Star Vell', image: '/images/brands/brand5.png' },
                { name: 'Spnka', image: '/images/brands/brand6.png' },
                { name: 'Win Brand', image: '/images/brands/brand7.png' },
              ].map((brand) => (
                <div key={brand.name} className="flex-shrink-0">
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    title={brand.name}
                    className="h-28 w-auto object-contain"
                  />
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[
                { name: 'Success', image: '/images/brands/brand1.png' },
                { name: 'Da Mo', image: '/images/brands/brand2.png' },
                { name: 'Lime Brand', image: '/images/brands/brand3.png' },
                { name: 'Sonny', image: '/images/brands/brand4.png' },
                { name: 'Star Vell', image: '/images/brands/brand5.png' },
                { name: 'Spnka', image: '/images/brands/brand6.png' },
                { name: 'Win Brand', image: '/images/brands/brand7.png' },
              ].map((brand) => (
                <div key={`dup-${brand.name}`} className="flex-shrink-0">
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    title={brand.name}
                    className="h-28 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('bestSellers.title')}</h2>
              <p className="text-gray-500 mt-2">{t('bestSellers.description')}</p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
            >
              {t('common.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts?.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              {t('common.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('cta.startShopping')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
