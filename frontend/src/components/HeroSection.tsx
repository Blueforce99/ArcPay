'use client';

import React from 'react';
import { ArrowRight, Globe, Shield, Zap, TrendingUp, Smartphone } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 space-y-16">
      {/* Hero Content */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
              Send Money
              <span className="block gradient-primary bg-clip-text text-transparent">
                Across Borders
              </span>
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed">
              Fast, secure, and transparent cross-border payments powered by Circle & Arc. 
              Send remittances to over 25 countries instantly with minimal fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn-primary flex items-center justify-center gap-2 text-lg">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2 text-lg">
              Learn More
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-8 pt-8">
            <div>
              <p className="text-3xl font-bold text-neutral-900">Instant</p>
              <p className="text-sm text-neutral-600">Settlement</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900">0.5%</p>
              <p className="text-sm text-neutral-600">Low Fees</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900">25+</p>
              <p className="text-sm text-neutral-600">Countries</p>
            </div>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="hidden lg:block">
          <div className="glass rounded-2xl p-8 space-y-6">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center animate-slideInRight">
              <Globe className="w-32 h-32 text-primary-500 opacity-30" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 pt-20 border-t border-neutral-200">
        {[
          {
            icon: <Zap className="w-8 h-8" />,
            title: 'Lightning Fast',
            description: 'Settle payments in seconds with blockchain confirmation',
          },
          {
            icon: <Shield className="w-8 h-8" />,
            title: 'Secure & Verified',
            description: 'Military-grade encryption and multi-sig security',
          },
          {
            icon: <TrendingUp className="w-8 h-8" />,
            title: 'Real Rates',
            description: 'No hidden fees, transparent exchange rates',
          },
          {
            icon: <Globe className="w-8 h-8" />,
            title: 'Global Coverage',
            description: 'Send to 25+ countries instantly',
          },
          {
            icon: <Smartphone className="w-8 h-8" />,
            title: 'Mobile First',
            description: 'Send money from your phone anytime, anywhere',
          },
          {
            icon: <TrendingUp className="w-8 h-8" />,
            title: '24/7 Support',
            description: 'Round-the-clock customer support team',
          },
        ].map((feature, i) => (
          <div key={i} className="card group cursor-pointer hover:border-primary-300">
            <div className="p-3 bg-primary-50 rounded-lg inline-block mb-4 group-hover:bg-primary-100 transition">
              <div className="text-primary-600">{feature.icon}</div>
            </div>
            <h3 className="font-semibold text-lg text-neutral-900 mb-2">{feature.title}</h3>
            <p className="text-neutral-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
