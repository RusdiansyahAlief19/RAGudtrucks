const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');

// Konfigurasi endpoint FastAPI
const API_URL = 'http://127.0.0.1:8000/chat';

// Membangun elemen indikator mengetik
const typingIndicator = document.createElement('div');
typingIndicator.className = 'message ai-message typing-indicator-wrapper';
typingIndicator.innerHTML = `
    <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    </div>
`;

// Helper: memformat respons teks (Bold, Lists)
function formatResponse(text) {
    // Tangani error message fallback jika tidak ada teks
    if (!text) return "";
    
    // Bold: **text** menjadi <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // List item dengan dash atau asterisk di awal baris
    formatted = formatted.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>');
    
    // Bungkus semua li berurutan ke dalam ul
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Pisahkan paragraf / baris baru
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Bersihkan br tambahan setelah /ul
    formatted = formatted.replace(/<\/ul><br>/g, '</ul>');
    
    return formatted;
}

// Menambahkan pesan ke dalam window chat
function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    if (sender === 'ai') {
        bubbleDiv.innerHTML = formatResponse(text);
    } else {
        bubbleDiv.textContent = text;
    }
    
    messageDiv.appendChild(bubbleDiv);
    
    // Masukkan tepat sebelum typing indicator, atau di akhir jika tidak ada
    if (chatWindow.contains(typingIndicator)) {
        chatWindow.insertBefore(messageDiv, typingIndicator);
    } else {
        chatWindow.appendChild(messageDiv);
    }
    
    scrollToBottom();
}

function showTypingIndicator() {
    chatWindow.appendChild(typingIndicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    if (chatWindow.contains(typingIndicator)) {
        chatWindow.removeChild(typingIndicator);
    }
}

function scrollToBottom() {
    // Beri sedikit delay untuk memastikan render DOM terbaru terbaca dimensinya
    setTimeout(() => {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 50);
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = userInput.value.trim();
    if (!query) return;
    
    // Nonaktifkan input sementara saat menunggu respons
    userInput.value = '';
    userInput.disabled = true;
    
    // 1. Tampilkan pesan user
    appendMessage('user', query);
    
    // 2. Tampilkan indikator mengetik AI
    showTypingIndicator();
    
    try {
        // 3. Kirim POST request ke endpoint backend FastAPI
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });
        
        const data = await response.json();
        
        // 4. Sembunyikan indikator dan render jawaban
        hideTypingIndicator();
        
        if (data.error) {
            appendMessage('ai', `**Error**: ${data.error}`);
        } else if (data.answer) {
            appendMessage('ai', data.answer);
        } else {
            appendMessage('ai', "Maaf, terjadi kesalahan tak terduga saat memproses respons.");
        }
        
    } catch (error) {
        hideTypingIndicator();
        console.error("Fetch error:", error);
        appendMessage('ai', "**Koneksi Gagal**: Tidak dapat terhubung ke server. Pastikan backend FastAPI sudah berjalan (`uvicorn main:app`).");
    } finally {
        // Aktifkan kembali input
        userInput.disabled = false;
        userInput.focus();
    }
});

// --- TCO CALCULATOR LOGIC ---
const tcoBtn = document.getElementById('tco-btn');
const tcoModal = document.getElementById('tco-modal');
const tcoCloseBtn = document.getElementById('tco-close-btn');

const truckTypeSelect = document.getElementById('tco-truck-type');
const distanceSlider = document.getElementById('tco-distance');
const distanceVal = document.getElementById('tco-distance-val');
const fuelPriceSlider = document.getElementById('tco-fuel-price');
const fuelPriceVal = document.getElementById('tco-fuel-price-val');

const resFuel = document.getElementById('res-fuel');
const resMaintenance = document.getElementById('res-maintenance');
const resTotal = document.getElementById('res-total');

// Konstanta dasar estimasi
const TRUCK_DATA = {
    quester: {
        kmPerLiter: 3.5, // Estimasi konsumsi Quester (Heavy Duty)
        maintenancePerYear: 35000000 // Estimasi servis & ban per tahun
    },
    kuzer: {
        kmPerLiter: 7.0, // Estimasi konsumsi Kuzer (Light-Medium Duty)
        maintenancePerYear: 15000000 // Estimasi servis & ban per tahun
    }
};

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function formatNumber(number) {
    return new Intl.NumberFormat('id-ID').format(number);
}

function calculateTCO() {
    const type = truckTypeSelect.value;
    const distance = parseInt(distanceSlider.value);
    const fuelPrice = parseInt(fuelPriceSlider.value);

    // Update label angka di slider
    distanceVal.textContent = formatNumber(distance);
    fuelPriceVal.textContent = formatNumber(fuelPrice);

    const data = TRUCK_DATA[type];
    
    // Hitung Biaya BBM = (Jarak / Efisiensi) * Harga per Liter
    const fuelLiters = distance / data.kmPerLiter;
    const fuelCost = fuelLiters * fuelPrice;
    
    // Hitung Total
    const maintenanceCost = data.maintenancePerYear;
    const totalCost = fuelCost + maintenanceCost;

    // Tampilkan Hasil
    resFuel.textContent = formatRupiah(fuelCost);
    resMaintenance.textContent = formatRupiah(maintenanceCost);
    resTotal.textContent = formatRupiah(totalCost);
}

// Event Listeners untuk Slider dan Select
truckTypeSelect.addEventListener('change', calculateTCO);
distanceSlider.addEventListener('input', calculateTCO);
fuelPriceSlider.addEventListener('input', calculateTCO);

// Buka/Tutup Modal
tcoBtn.addEventListener('click', () => {
    tcoModal.classList.add('active');
    calculateTCO(); // Hitung pertama kali saat dibuka
});

tcoCloseBtn.addEventListener('click', () => {
    tcoModal.classList.remove('active');
});

// Tutup modal jika klik di luar area konten
tcoModal.addEventListener('click', (e) => {
    if (e.target === tcoModal) {
        tcoModal.classList.remove('active');
    }
});
