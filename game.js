// --- ฐานข้อมูลสถานการณ์ (ตัวอย่างบางส่วนจาก 50 สถานการณ์) ---
const scenarioDatabase = [
    {
        text: "เพื่อนสนิทของคุณชวนไปงานเลี้ยงวันเกิด และพยายามคะยั้นคะยอให้คุณลองดื่มเครื่องดื่มแอลกอฮอล์ โดยบอกว่า 'แก้วเดียวไม่เมาหรอก อย่าทำให้เสียบรรยากาศเลย'",
        options: [
            { text: "ยอมดื่มเพื่อรักษาความสัมพันธ์และบรรยากาศ", effect: { health: -10, risk: 15, decision: -5, social: 10 } },
            { text: "ปฏิเสธอย่างสุภาพและเลือกดื่มน้ำอัดลมแทน", effect: { health: 5, risk: -5, decision: 10, social: 5 } },
            { text: "บอกเหตุผลที่ชัดเจนว่าไม่ดื่ม และเสนอตัวเป็นคนดูแลเพื่อนๆ แทน", effect: { health: 10, risk: -10, decision: 15, social: 8 } }
        ]
    },
    {
        text: "คุณเห็นเพื่อนร่วมกลุ่มแอบนำเหล้าเข้ามาดื่มในค่ายทักษะชีวิต และเขาชวนคุณเข้าร่วมด้วยโดยสัญญาว่าจะไม่บอกใคร",
        options: [
            { text: "เข้าร่วมเพราะไม่อยากถูกมองว่าเป็นคนขี้ฟ้อง", effect: { health: -5, risk: 20, decision: -10, social: 5 } },
            { text: "ปฏิเสธและเตือนเพื่อนถึงกฎของค่าย", effect: { health: 5, risk: -5, decision: 10, social: -2 } },
            { text: "แจ้งพี่เลี้ยงหรือผู้รับผิดชอบอย่างลับๆ เพื่อความปลอดภัย", effect: { health: 0, risk: -15, decision: 15, social: 0 } }
        ]
    }
    // หมายเหตุ: ในระบบจริงจะมีการเพิ่มให้ครบ 50 สถานการณ์ในลักษณะเดียวกันนี้
];

// สร้างสถานการณ์จำลองเพิ่มเติมให้ครบ 50 (เพื่อสาธิตระบบ)
for(let i=3; i<=50; i++) {
    scenarioDatabase.push({
        text: `สถานการณ์ที่ ${i}: คุณอยู่ในกลุ่มเพื่อนที่กำลังกดดันให้คุณทำบางอย่างที่เสี่ยงต่อสุขภาพในงานเทศกาลท้องถิ่น คุณจะตัดสินใจอย่างไร?`,
        options: [
            { text: "ทำตามกลุ่มเพื่อความสนุกชั่วคราว", effect: { health: -5, risk: 10, decision: -5, social: 10 } },
            { text: "ขอตัวกลับบ้านหรือไปหาเพื่อนกลุ่มอื่น", effect: { health: 5, risk: -5, decision: 8, social: -2 } },
            { text: "ยืนยันคำเดิมว่าไม่ทำ และอธิบายถึงผลเสีย", effect: { health: 5, risk: -10, decision: 15, social: 5 } }
        ]
    });
}

// --- การจัดการสถานะผู้เล่น ---
let player = { name: "", school: "", stats: { health: 50, risk: 20, decision: 50, social: 50 } };
let currentScenarioIndex = 0;
let sessionScenarios = [];
let surveyStep = 0;

const surveyQuestions = [
    { q: "คนใกล้ชิดของคุณมีการดื่มแอลกอฮอล์เป็นประจำหรือไม่?", effects: { social: 5, risk: 5 } },
    { q: "ในชุมชนของคุณ การดื่มแอลกอฮอล์เป็นเรื่องปกติที่พบเห็นได้ทั่วไปใช่ไหม?", effects: { risk: 10 } },
    { q: "คุณเคยรู้สึกกดดันจากกลุ่มเพื่อนให้ลองทำสิ่งที่ไม่อยากทำหรือไม่?", effects: { decision: -5 } }
];

function showScreen(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function handleRegistration() {
    player.name = document.getElementById('player-name').value;
    player.school = document.getElementById('school-name').value;
    if (player.name && player.school) showSurvey();
    else alert("กรุณากรอกข้อมูลให้ครบถ้วน");
}

function showSurvey() {
    showScreen('screen-survey');
    if (surveyStep < surveyQuestions.length) {
        const q = surveyQuestions[surveyStep];
        document.getElementById('survey-question').innerText = q.q;
        const container = document.getElementById('survey-options');
        container.innerHTML = `
            <button class="option-btn" onclick="applySurvey(true)">ใช่ / เคย</button>
            <button class="option-btn" onclick="applySurvey(false)">ไม่ใช่ / ไม่เคย</button>
        `;
    } else {
        startSimulation();
    }
}

function applySurvey(isYes) {
    if (isYes) {
        const effects = surveyQuestions[surveyStep].effects;
        for (let s in effects) player.stats[s] += effects[s];
    }
    surveyStep++;
    showSurvey();
}

function startSimulation() {
    sessionScenarios = scenarioDatabase.sort(() => 0.5 - Math.random()).slice(0, 20);
    showScreen('screen-game');
    renderScenario();
}

function renderScenario() {
    if (currentScenarioIndex >= sessionScenarios.length) return endSimulation();
    
    const sn = sessionScenarios[currentScenarioIndex];
    document.getElementById('progress-text').innerText = `สถานการณ์ที่ ${currentScenarioIndex + 1} จาก 20`;
    document.getElementById('progress-bar').style.width = `${(currentScenarioIndex / 20) * 100}%`;
    document.getElementById('scenario-text').innerText = sn.text;
    
    const container = document.getElementById('game-options');
    container.innerHTML = '';
    sn.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => {
            for (let s in opt.effect) player.stats[s] += opt.effect[s];
            currentScenarioIndex++;
            renderScenario();
        };
        container.appendChild(btn);
    });
}

function endSimulation() {
    showScreen('screen-results');
    saveToLeaderboard();
    generateAnalytics();
    renderLeaderboard();
}

function generateAnalytics() {
    const s = player.stats;
    let profile = { title: "", desc: "" };
    let ending = "";

    // ตัวอย่างการวิเคราะห์โปรไฟล์ (10 แบบ)
    if (s.decision > 150) {
        profile = { title: "ผู้นำทางความคิดรุ่นใหม่", desc: "คุณมีความหนักแน่นในการตัดสินใจ และไม่โอนอ่อนตามแรงกดดันทางสังคม" };
        ending = "เส้นทางสู่ผู้นำเยาวชนระดับประเทศ";
    } else if (s.risk > 120) {
        profile = { title: "ผู้กล้าเสี่ยง (High Risk)", desc: "คุณมักตัดสินใจโดยเน้นความสนุกชั่วคราว ซึ่งอาจนำไปสู่ผลกระทบระยะยาว" };
        ending = "บทเรียนราคาแพงจากความประมาท";
    } else if (s.health > 100) {
        profile = { title: "ผู้รักสุขภาพและสวัสดิภาพ", desc: "คุณให้ความสำคัญกับร่างกายและอนาคตของตัวเองเป็นอันดับหนึ่ง" };
        ending = "ชีวิตที่สมดุลและสุขภาพที่ยั่งยืน";
    } else {
        profile = { title: "นักปรับตัวทางสังคม", desc: "คุณพยายามรักษาสมดุลระหว่างเพื่อนและการตัดสินใจส่วนตัว" };
        ending = "การเติบโตผ่านประสบการณ์ทางสังคม";
    }
    
    document.getElementById('profile-title').innerText = "โปรไฟล์ของคุณ: " + profile.title;
    document.getElementById('profile-desc').innerText = profile.desc;
    document.getElementById('ending-text').innerText = ending;

    new Chart(document.getElementById('behaviorChart'), {
        type: 'radar',
        data: {
            labels: ['สุขภาพ', 'การควบคุมความเสี่ยง', 'ทักษะการตัดสินใจ', 'อิทธิพลทางสังคม'],
            datasets: [{
                label: 'คะแนนพฤติกรรม',
                data: [s.health, 150 - s.risk, s.decision, s.social],
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderColor: '#38bdf8',
                borderWidth: 2,
                pointBackgroundColor: '#38bdf8'
            }]
        },
        options: { 
            scales: { r: { beginAtZero: true, grid: { color: '#334155' }, ticks: { display: false } } },
            plugins: { legend: { labels: { color: '#fff', font: { family: 'Sarabun' } } } }
        }
    });
}

function saveToLeaderboard() {
    let data = JSON.parse(localStorage.getItem('ydsp_thai_data') || '[]');
    data.push({ school: player.school, score: player.stats.decision });
    localStorage.setItem('ydsp_thai_data', JSON.stringify(data));
}

function renderLeaderboard() {
    const data = JSON.parse(localStorage.getItem('ydsp_thai_data') || '[]');
    const schools = {};
    
    data.forEach(entry => {
        if (!schools[entry.school]) schools[entry.school] = { total: 0, count: 0 };
        schools[entry.school].total += entry.score;
        schools[entry.school].count += 1;
    });

    const sorted = Object.keys(schools).map(name => ({
        name,
        avg: Math.round(schools[name].total / schools[name].count),
        count: schools[name].count
    })).sort((a, b) => b.avg - a.avg);

    const tbody = document.querySelector('#leaderboard-table tbody');
    tbody.innerHTML = sorted.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.avg}</td>
            <td>${s.count} คน</td>
        </tr>
    `).join('');
}
