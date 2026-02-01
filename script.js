const amountInput = document.getElementById('amount');
const resultAmount = document.getElementById('result-amount');
const resultCurrency = document.getElementById('result-currency');
const rateInfo = document.getElementById('rate-info');
const lastUpdated = document.getElementById('last-updated');
const swapBtn = document.getElementById('swap-btn');

// State
let currencies = {}; // Stores code -> name map
let rates = {}; // Stores rates relative to USD (base)
let fromCode = 'USD';
let toCode = 'EUR';

// API Endpoints
// We use ExchangeRate-API for broader currency support (160+)
const API_URL = 'https://open.er-api.com/v6/latest/USD';

// Theme Colors Mapped to Region/Currency
// Logic: Americas=Green/Cyan, Europe=Blue, Asia=Red/Pink, Oceania=Yellow/Orange, Africa=Purple
// Theme Colors Mapped to Region/Currency
// Logic: Strictly Flag Colors for blobs (Blob 1, 2, 3) + Accent
const currencyThemes = {
    // US: Red, White, Blue
    USD: { accent: '#3b82f6', blob1: '#B22234', blob2: '#FFFFFF', blob3: '#3C3B6E' },
    // EU: Blue, Yellow (Stars)
    EUR: { accent: '#eab308', blob1: '#003399', blob2: '#FFCC00', blob3: '#003399' },
    // UK: Red, White, Blue (Royal)
    GBP: { accent: '#ef4444', blob1: '#C8102E', blob2: '#FFFFFF', blob3: '#012169' },
    // Japan: Red (Sun), White
    JPY: { accent: '#ef4444', blob1: '#BC002D', blob2: '#FFFFFF', blob3: '#BC002D' },
    // India: Saffron (Top), Green (Right), White (Middle)
    INR: { accent: '#f97316', blob1: '#FF9933', blob2: '#138808', blob3: '#FFFFFF' },
    // Canada: Red, White
    CAD: { accent: '#ef4444', blob1: '#FF0000', blob2: '#FFFFFF', blob3: '#FF0000' },
    // Australia: Blue, White, Red (Union Jack + Stars)
    AUD: { accent: '#3b82f6', blob1: '#00008B', blob2: '#FFFFFF', blob3: '#FF0000' },
    // Brazil: Green, Yellow, Blue
    BRL: { accent: '#84cc16', blob1: '#009c3b', blob2: '#ffdf00', blob3: '#002776' },
    // China: Red, Yellow
    CNY: { accent: '#eab308', blob1: '#EE1C25', blob2: '#FFFF00', blob3: '#EE1C25' },
    // Russia: White, Blue, Red
    RUB: { accent: '#ef4444', blob1: '#FFFFFF', blob2: '#0039A6', blob3: '#D52B1E' },
    // South Africa: Green, Red, Blue, Yellow (Multi)
    ZAR: { accent: '#eab308', blob1: '#007A4D', blob2: '#DE3831', blob3: '#002395' },
    // Switzerland: Red, White
    CHF: { accent: '#ef4444', blob1: '#FF0000', blob2: '#FFFFFF', blob3: '#FF0000' },
    // Sweden: Blue, Yellow
    SEK: { accent: '#eab308', blob1: '#006AA7', blob2: '#FECC00', blob3: '#006AA7' },
    // Saudi Arabia: Green, White
    SAR: { accent: '#16a34a', blob1: '#165d31', blob2: '#ffffff', blob3: '#165d31' },
    // UAE: Red, Green, White, Black
    AED: { accent: '#ef4444', blob1: '#FF0000', blob2: '#00732F', blob3: '#FFFFFF' },

    // Default Fallback (Cyan/Blue)
    DEFAULT: { accent: '#38bdf8', blob1: '#4f46e5', blob2: '#ec4899', blob3: '#06b6d4' }
};

// Helper: Get Flag Image URL
const getFlagImage = (currencyCode) => {
    const currencyToCountry = {
        USD: 'us', EUR: 'eu', GBP: 'gb', JPY: 'jp', AUD: 'au', CAD: 'ca', CHF: 'ch',
        CNY: 'cn', SEK: 'se', NZD: 'nz', MXN: 'mx', SGD: 'sg', HKD: 'hk', NOK: 'no',
        KRW: 'kr', TRY: 'tr', RUB: 'ru', INR: 'in', BRL: 'br', ZAR: 'za', PHP: 'ph',
        TWD: 'tw', THB: 'th', IDR: 'id', MYR: 'my', VND: 'vn', ILS: 'il', PLN: 'pl',
        DKK: 'dk', CZK: 'cz', HUF: 'hu', AED: 'ae', SAR: 'sa', CLP: 'cl', ARS: 'ar',
        COP: 'co', EGP: 'eg', FJD: 'fj', GHS: 'gh', ISK: 'is', KES: 'ke', LKR: 'lk',
        MAD: 'ma', NGN: 'ng', PEN: 'pe', PKR: 'pk', RON: 'ro', UAH: 'ua', VEF: 've',
        OMR: 'om', KWD: 'kw', BHD: 'bh', QAR: 'qa', JOD: 'jo', BDT: 'bd', UYU: 'uy',
        AFN: 'af', ALL: 'al', AMD: 'am', ANG: 'cw', AOA: 'ao', AZN: 'az', BAM: 'ba',
        BBD: 'bb', BGN: 'bg', BIF: 'bi', BMD: 'bm', BND: 'bn', BOB: 'bo', BSD: 'bs',
        BTN: 'bt', BWP: 'bw', BYN: 'by', BZD: 'bz', CDF: 'cd', CRC: 'cr', CUP: 'cu',
        CVE: 'cv', DJF: 'dj', DOP: 'do', DZD: 'dz', ERN: 'er', ETB: 'et', GEL: 'ge',
        GMD: 'gm', GNF: 'gn', GTQ: 'gt', GYD: 'gy', HNL: 'hn', HTG: 'ht', IQD: 'iq',
        IRR: 'ir', JMD: 'jm', KGS: 'kg', KHR: 'kh', KMF: 'km', KYD: 'ky', KZT: 'kz',
        LAK: 'la', LBP: 'lb', LSL: 'ls', LYD: 'ly', MDL: 'md', MGA: 'mg', MKD: 'mk',
        MMK: 'mm', MNT: 'mn', MOP: 'mo', MUR: 'mu', MVR: 'mv', MWK: 'mw', MZN: 'mz',
        NAD: 'na', NIO: 'ni', NPR: 'np', PAB: 'pa', PGK: 'pg', PYG: 'py', RSD: 'rs',
        RWF: 'rw', SBD: 'sb', SCR: 'sc', SDG: 'sd', SOS: 'so', SRD: 'sr', SSP: 'ss',
        STD: 'st', SYP: 'sy', SZL: 'sz', TJS: 'tj', TMT: 'tm', TND: 'tn', TOP: 'to',
        TTD: 'tt', TZS: 'tz', UGX: 'ug', UZS: 'uz', VES: 've', VUV: 'vu', WST: 'ws',
        XAF: 'cm', XCD: 'ag', XOF: 'sn', XPF: 'pf', YER: 'ye', ZMW: 'zm', ZWL: 'zw'
    };

    // Fallback logic try to use first 2 chars of currency code -> country code
    let code = currencyToCountry[currencyCode];
    if (!code) code = currencyCode.substring(0, 2).toLowerCase();

    // FlagCDN
    return `https://flagcdn.com/w40/${code}.png`;
};

// --- API & Initialization ---

async function init() {
    try {
        rateInfo.textContent = 'Fetching exchange rates...';
        // Cache Busting
        const response = await fetch(`${API_URL}?t=${Date.now()}`);
        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        rates = data.rates;

        // Update the "Last Updated" text if available
        if (data.date) {
            const date = new Date(data.date); // API returns YYYY-MM-DD usually, or unix
            // actually v4 returns 'date' string YYYY-MM-DD and 'time_last_updated' unix
            // We'll just stick to "just now" for the fetch time, or use local time.
        }

        // Build currency map from rates (Open API doesn't give names, so we use codes or a static list if we want names)
        // For lightness, we will just use the codes from the rates object and map common names if possible,
        // or just use the code.
        const sortedCodes = Object.keys(rates).sort();

        // Create a simple map. In a real app we might fetch a separate names list.
        // We'll use Intl.DisplayNames to get full names if available
        const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });

        sortedCodes.forEach(code => {
            try {
                currencies[code] = currencyNames.of(code);
            } catch (e) {
                currencies[code] = code;
            }
        });

        // Initialize Dropdowns
        setupDropdown('dropdown-from', 'from', sortedCodes);
        setupDropdown('dropdown-to', 'to', sortedCodes);

        // Initial Conversion
        updateUI();
        applyTheme(toCode); // Theme based on Target Currency

    } catch (error) {
        console.error(error);
        rateInfo.textContent = 'Failed to load rates. Check connection.';
    }
}

// --- Custom Dropdown Logic ---

function setupDropdown(elementId, type, codes) {
    const container = document.getElementById(elementId);
    const selectedDisplay = container.querySelector('.selected-option');
    const menu = container.querySelector('.dropdown-menu');
    const list = container.querySelector('.options-list');
    const searchInput = container.querySelector('input');

    // Populate List
    const populateList = (filter = '') => {
        list.innerHTML = '';
        const lowerFilter = filter.toLowerCase();

        codes.forEach(code => {
            const name = currencies[code] || code;
            if (code.toLowerCase().includes(lowerFilter) || name.toLowerCase().includes(lowerFilter)) {
                const li = document.createElement('li');
                li.className = 'option-item';
                li.innerHTML = `
                    <img src="${getFlagImage(code)}" alt="${code}" class="flag-img" onerror="this.src='https://flagcdn.com/w40/un.png'">
                    <span class="code">${code}</span>
                    <span class="name">${name}</span>
                `;
                li.onclick = () => {
                    selectCurrency(type, code);
                    closeDropdown(container);
                };
                list.appendChild(li);
            }
        });
    };

    populateList();

    // Toggle Dropdown
    selectedDisplay.onclick = (e) => {
        // Toggle open/close
        const isOpen = container.classList.contains('open');

        // Close others
        document.querySelectorAll('.custom-dropdown').forEach(el => {
            if (el !== container) closeDropdown(el);
        });

        if (!isOpen) {
            container.classList.add('open');
            searchInput.focus(); // Focus search immediately on open
        } else {
            closeDropdown(container);
        }
    };

    // Auto-focus search on keypress when dropdown is open (or even just focused parent)
    container.addEventListener('keydown', (e) => {
        if (!container.classList.contains('open')) return;

        // If user is typing regular characters and focus is NOT already on input
        if (e.key.length === 1 && document.activeElement !== searchInput) {
            searchInput.focus();
            // We don't prevent default, so the char gets typed into the input? 
            // Actually, if we focus immediately, the char might be lost or typed.
            // Let's just focus.
        }
        // Handle Escape to close
        if (e.key === 'Escape') {
            closeDropdown(container);
        }
    });

    // Search Filter
    searchInput.addEventListener('input', (e) => populateList(e.target.value));

    // Enter to Select First Option
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const firstOption = list.querySelector('.option-item');
            if (firstOption) {
                firstOption.click();
                e.preventDefault(); // Prevent default form submission if any
            }
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            closeDropdown(container);
        }
    });
}

function closeDropdown(container) {
    container.classList.remove('open');
    // Reset search
    const search = container.querySelector('input');
    if (search) {
        search.value = '';
        // Optional: Reset list to full logic if needed, but safer to leave as is until reopen
        // Or re-trigger populateList('') here if we had access to it easily.
        // We'll accept state persistence for now or access specific function if refactored.
        // Better: trigger input event to reset list
        const event = new Event('input');
        search.dispatchEvent(event);
    }
}

function selectCurrency(type, code) {
    if (type === 'from') {
        fromCode = code;
        updateDropdownDisplay('dropdown-from', code);
    } else {
        toCode = code;
        updateDropdownDisplay('dropdown-to', code);
        applyTheme(code);
    }
    convertCurrency();
}

function updateDropdownDisplay(elementId, code) {
    const container = document.getElementById(elementId);
    container.querySelector('.flag').innerHTML = `<img src="${getFlagImage(code)}" alt="${code}" class="flag-img" onerror="this.src='https://flagcdn.com/w40/un.png'">`;
    container.querySelector('.code').textContent = code;
}

// --- Conversion & Theme Logic ---

function convertCurrency() {
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount === 0) {
        resultAmount.textContent = '0.00';
        resultCurrency.textContent = toCode;
        return;
    }

    // Rate Calculation (Base is USD)
    // Rate FROM -> TO = (USD->TO) / (USD->FROM)
    const rateFrom = rates[fromCode];
    const rateTo = rates[toCode];

    if (!rateFrom || !rateTo) return;

    const conversionRate = rateTo / rateFrom;
    const finalAmount = amount * conversionRate;

    resultAmount.textContent = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(finalAmount);

    resultCurrency.textContent = toCode;

    // Info Text
    rateInfo.textContent = `1 ${fromCode} = ${conversionRate.toFixed(4)} ${toCode}`;
    lastUpdated.textContent = new Date().toLocaleTimeString();
}

function updateUI() {
    amountInput.value = 1; // Reset or keep? let's keep default 1
    updateDropdownDisplay('dropdown-from', fromCode);
    updateDropdownDisplay('dropdown-to', toCode);
    convertCurrency();
}

function applyTheme(currencyCode) {
    const theme = currencyThemes[currencyCode] || currencyThemes.DEFAULT;
    const root = document.documentElement;

    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--accent-glow', `${theme.accent}80`); // 50% opacity
    root.style.setProperty('--blob-1', theme.blob1);
    root.style.setProperty('--blob-2', theme.blob2);
    root.style.setProperty('--blob-3', theme.blob3);
}

// Event Listeners
amountInput.addEventListener('input', () => {
    convertCurrency();
});

swapBtn.addEventListener('click', () => {
    // Swap codes
    const temp = fromCode;
    fromCode = toCode;
    toCode = temp;

    // Update UI
    updateDropdownDisplay('dropdown-from', fromCode);
    updateDropdownDisplay('dropdown-to', toCode);

    // Update Theme based on new To Code
    applyTheme(toCode);
    convertCurrency();

    // Animation
    swapBtn.classList.add('spin');
    setTimeout(() => swapBtn.classList.remove('spin'), 300);
});

// Global Shortcuts
document.addEventListener('keydown', (e) => {
    // If we are already in an input, do nothing
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // If a dropdown is open, let it handle keys (searching)
    if (document.querySelector('.custom-dropdown.open')) return;

    // Check for numbers or decimal point (including comma for international)
    if (/^[0-9.,]$/.test(e.key)) {
        amountInput.focus();
        // We do NOT preventDefault here. 
        // This allows the browser to type the key into the newly focused input naturally.
    }
});

// Start
init();
