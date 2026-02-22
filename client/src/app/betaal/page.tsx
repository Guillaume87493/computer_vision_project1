import Link from 'next/link'
import React from 'react'



function BetalingsPagina() {
  const email = 'guillaume.declerck2009@gmail.com'
  const link = 'https://buy.stripe.com/test_bJeeVe9879Mj7m3bgYbjW06'
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 text-center">
        {/* Icoon of Badge */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="C9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-black mb-2">Maak Factuur</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Klik op de onderstaande knop om veilig te betalen en je factuur direct te genereren.
        </p>

        {/* De Knop */}
        <Link 
          href={`${link}?prefilled_email=${email}`}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200"
        >
          <div className="flex justify-between items-center px-2">
            <span>Nu Betalen</span>
            <span className="bg-blue-500 py-1 px-3 rounded-lg text-sm">€ 9.99</span>
          </div>
        </Link>

        <p className="mt-6 text-xs text-gray-400 flex items-center justify-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Beveiligd via Stripe
        </p>
      </div>
    </div>
  )
}

export default BetalingsPagina
