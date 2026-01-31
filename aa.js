(async () => {
    // 1. Clear page and setup styling
    document.body.innerHTML = `
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f12; color: #e0e0e0; padding: 30px; line-height: 1.6; }
            .section { border-left: 5px solid #00d4ff; padding: 20px; margin-bottom: 25px; background: #1a1b23; border-radius: 0 8px 8px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
            h2 { color: #00d4ff; margin-top: 0; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; }
            .row { margin-bottom: 8px; display: flex; border-bottom: 1px solid #2a2c3a; padding-bottom: 4px; }
            .label { font-weight: bold; color: #888eaf; width: 180px; flex-shrink: 0; }
            .value { color: #ffffff; word-break: break-all; }
            .highlight { color: #ffcc00; font-weight: bold; }
            h1 { text-align: center; color: #fff; margin-bottom: 40px; }
            #output { max-width: 900px; margin: 0 auto; }
        </style>
        <h1>Xsolla Intelligence Dashboard</h1>
        <div id="output">Initializing extraction...</div>
    `;
    
    const output = document.getElementById('output');

    try {
        // --- STEP 1: Profile & IDs ---
        const initRes = await fetch("https://api.xsolla.com/merchant/v3/users/init", { credentials: "include" });
        const initData = await initRes.json();
        const mID = initData.init_merchant_id;

        output.innerHTML = `
            <div class="section">
                <h2>User Profile</h2>
                <div class="row"><span class="label">Name:</span><span class="value">${initData.user.name}</span></div>
                <div class="row"><span class="label">Email:</span><span class="value">${initData.user.email}</span></div>
                <div class="row"><span class="label">Job Title:</span><span class="value">${initData.user.job_title}</span></div>
                <div class="row"><span class="label">Merchant ID:</span><span class="value highlight">${mID}</span></div>
            </div>
            <div id="step2"></div><div id="step3"></div>
        `;

        // --- STEP 2: Merchant Users ---
        const usersRes = await fetch(`https://api.xsolla.com/merchant/current/merchants/${mID}/users`, { credentials: "include" });
        const usersData = await usersRes.json();
        
        document.getElementById('step2').innerHTML = `
            <div class="section">
                <h2>Merchant Staff</h2>
                ${usersData.map(u => `
                    <div class="row">
                        <span class="label">${u.role}:</span>
                        <span class="value">${u.name} (${u.email})</span>
                    </div>
                `).join('')}
            </div>
        `;

        // --- STEP 3: Agreement Details ---
        const agRes = await fetch(`https://api.xsolla.com/merchant/current/merchants/${mID}/agreements`, { credentials: "include" });
        const agData = await agRes.json();
        const aID = agData[0]?.id;

        const detailRes = await fetch(`https://api.xsolla.com/merchant/current/merchants/${mID}/agreements/${aID}`, { credentials: "include" });
        const d = await detailRes.json();

        document.getElementById('step3').innerHTML = `
            <div class="section">
                <h2>Agreement & PII (ID: ${aID})</h2>
                <div class="row"><span class="label">Legal Name:</span><span class="value">${d.legal_name}</span></div>
                <div class="row"><span class="label">Phone:</span><span class="value">${d.phone}</span></div>
                <div class="row"><span class="label">Address:</span><span class="value">${d.address.address_line1}, ${d.address.city}, ${d.address.zip_code} ${d.country}</span></div>
                <div class="row"><span class="label">Tax ID:</span><span class="value">${d.tax_identification_number}</span></div>
                <div class="row"><span class="label">Active Payout:</span><span class="value highlight">${d.active_account}</span></div>
                <div class="row"><span class="label">PayPal Email:</span><span class="value">${d.accounts.pay_pal?.address || 'N/A'}</span></div>
                <div class="row"><span class="label">Agreement URL:</span><span class="value"><a href="${d.agreement_url}" target="_blank" style="color:#00d4ff">View Document</a></span></div>
            </div>
        `;

    } catch (err) {
        output.innerHTML += `<div class="section" style="border-color: #ff4444;"><h2>Critical Error</h2>${err}</div>`;
    }
})();
