interface PricingPlan {
      name: string;
      price: string;
      interval: string;
      link: string;
      features: string[]; // Handig om te laten zien wat ze krijgen!
    }

   export  const plans: PricingPlan[] = [
      {
        name: "Maandelijks Plan",
        price: "19",
        interval: "maand",
        link: "https://buy.stripe.com/test_7sY00kfwvbUrbCj84MbjW00", 
        features: ["Toegang tot alle functies", "Maandelijks opzegbaar", "Support via e-mail"],
      },
      {
        name: "Jaarlijks Plan",
        price: "99",
        interval: "jaar",
        link: "https://buy.stripe.com/test_fZu5kE9872jRgWD2KsbjW01",
        features: ["Alles in Maandelijks", "Bespaar meer dan 50%", "Priority support"],
      },
      {
        name: "Jaarlijks Plan",
        price: "67",
        interval: "jaar",
        link: "https://buy.stripe.com/test_fZu14ofwvbUrcGnbgYbjW02",
        features: ["Alles in Maandelijks", "Bespaar meer dan 50%", "Priority support"],
      }
    ];
