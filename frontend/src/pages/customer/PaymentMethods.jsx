import { Phone } from 'lucide-react';

const PaymentMethods = () => {
  const deliveryTerms = [
    {
      tamil: 'பட்டாசு பெட்டிக்கான டெலிவரி தொகை தாங்களே பார்சல் பெறும் பொழுது செலுத்தி பெற்றுக்கொள்ளவேண்டும்.',
      english: 'Delivery Charges is Not Free, Customer Should Pay for that at the time of receiving the Parcel'
    },
    {
      tamil: '2022, அக்டோபர் 1ம் தேதி வரை டெலிவரி தொகை அனைத்து ஊர்களுக்கும் சராசரியாக டெலிவரி தொகை ரூ.250 முதல் ரூ.400 வரை இருக்கும்.',
      english: 'Upto October 1st, 2022 Delivery Charge Approximately in the range of Rs.250 to Rs.400.'
    },
    {
      tamil: 'அக்டோபர் 1ம் தேதி முதல் அக்டோபர் 20ம் தேதி வரை சென்னை, காஞ்சிபுரம், செங்கல்பட்டு, விழுப்புரம், திருவள்ளூர் தவிர மற்ற அனைத்து ஊர்களுக்கும் சராசரியாக டெலிவரி தொகை ரூ.300 முதல் ரூ.650 வரை இருக்கும்.',
      english: 'After October 1st, 2022 to October 20th, 2022 the Delivery Charge Approximately in the range of Rs.300 to Rs.650 which the areas rest of Chennai, Kanchipuram, Chengalpet, Villupuram and Tiruvallur.'
    },
    {
      tamil: '2022, அக்டோபர் 1ம் தேதி முதல் அக்டோபர் 20ம் தேதி வரை சென்னை, காஞ்சிபுரம், செங்கல்பட்டு, விழுப்புரம், திருவள்ளூர் ஆகிய ஊர்களுக்கும் சராசரியாக டெலிவரி தொகை ரூ.400 முதல் ரூ.800 வரை இருக்கும்.',
      english: 'After October 1st, 2022 to October 20th, 2022 the Delivery Charge for Chennai, Chengalpet, Kanchipuram, Villupuram is to be in the range of Rs.400 to Rs.800.'
    },
    {
      tamil: 'கேரளா, கர்நாடகா, ஆந்திரா, தெலுங்கானா மற்றும் பாண்டிச்சேரி ஆகிய மாநிலங்களுக்கு சராசரியாக டெலிவரி தொகை ரூ.500 முதல் ரூ.700 வரை இருக்கும்.',
      english: 'For Kerala, Karnataka, Andhra, Telangana and Pondicherry Delivery charge is approximately lies between Rs.500 to Rs.700.'
    },
    {
      tamil: 'மேலே குறிப்பிட்டுள்ள மாநிலங்களை தவிர மற்ற மாநிலங்களுக்கு சராசரியாக டெலிவரி தொகை ரூ.600 முதல் ரூ.900 வரை இருக்கும்.',
      english: 'For the all other states that are not mentioned above is to be Rs.600 to Rs.900 for all time.'
    }
  ];

  const bankAccounts = [
    {
      bank: 'State Bank of India',
      bankHindi: 'भारतीय स्टेट बैंक',
      tagline: 'THE BANKER TO EVERY INDIAN',
      logo: 'sbi',
      accountName: 'A. Kalaivanan',
      branch: 'Thiruthangal',
      accountNo: '20275712787',
      ifscCode: 'SBIN0012767'
    },
    {
      bank: 'Indian Bank',
      bankHindi: 'इंडियन बैंक',
      logo: 'indian-bank',
      accountName: 'A. Kalaivanan',
      branch: 'Virudhunagar',
      accountNo: '6854181424',
      ifscCode: 'IDIB000V025'
    }
  ];

  const upiMethods = [
    {
      name: 'Google Pay',
      logo: 'gpay',
      phone: '+91 96004 28362'
    },
    {
      name: 'PhonePe',
      logo: 'phonepe',
      phone: '+91 96004 28362'
    }
  ];

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            Payment Methods
          </h1>
          <div className="text-center mt-2 text-pink-200">
            <span>Mohana Pyro Park</span>
            <span className="mx-2">{'>'}</span>
            <span className="text-white">Payment Methods</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Delivery Terms & Conditions */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Delivery Charges Terms & Conditions:
          </h2>
          <ol className="space-y-4">
            {deliveryTerms.map((term, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-semibold text-gray-900">{index + 1}. </span>
                <span className="text-gray-800">{term.tamil}</span>
                {term.english && (
                  <span className="text-gray-600 ml-1">({term.english})</span>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-6 text-gray-700">
            <p className="font-semibold">நன்றி!</p>
            <p className="font-semibold">Thank You!</p>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="space-y-8 mb-8">
          {bankAccounts.map((account, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Bank Header */}
              <div className="bg-pink-50 p-6 flex flex-col items-center justify-center border-b border-pink-100">
                {account.bank === 'State Bank of India' ? (
                  <div className="text-center">
                    <p className="text-xl font-bold text-pink-700">{account.bankHindi}</p>
                    <p className="text-lg font-semibold text-gray-800">{account.bank}</p>
                    <p className="text-xs text-gray-500">{account.tagline}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xl font-bold text-pink-700">{account.bankHindi}</p>
                    <p className="text-lg font-semibold text-gray-800">{account.bank}</p>
                  </div>
                )}
              </div>

              {/* Account Details Table */}
              <div className="divide-y divide-pink-100">
                <div className="grid grid-cols-1 md:grid-cols-2 py-4 px-6">
                  <div className="text-pink-700 font-medium">A/C Name:</div>
                  <div className="text-gray-900">{account.accountName}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 py-4 px-6 bg-pink-50">
                  <div className="text-pink-700 font-medium">Bank:</div>
                  <div className="text-gray-900">{account.bank}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 py-4 px-6">
                  <div className="text-pink-700 font-medium">Branch:</div>
                  <div className="text-gray-900">{account.branch}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 py-4 px-6 bg-pink-50">
                  <div className="text-pink-700 font-medium">A/C No:</div>
                  <div className="text-gray-900 font-mono">{account.accountNo}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 py-4 px-6">
                  <div className="text-pink-700 font-medium">IFSC CODE:</div>
                  <div className="text-gray-900 font-mono">{account.ifscCode}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* UPI Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Pay */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center border border-pink-100">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-2xl font-semibold text-gray-800">Pay</span>
            </div>
            <div className="flex items-center gap-2 text-pink-700">
              <Phone className="w-5 h-5" />
              <span className="text-lg font-medium">+91 96004 28362</span>
            </div>
          </div>

          {/* PhonePe */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center border border-pink-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">₹</span>
              </div>
              <span className="text-xl font-semibold text-pink-600">PhonePe</span>
            </div>
            <div className="flex items-center gap-2 text-pink-700">
              <Phone className="w-5 h-5" />
              <span className="text-lg font-medium">+91 96004 28362</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
