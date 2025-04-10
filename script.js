document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('invoiceDate').valueAsDate = new Date();

    // Add item button functionality
    document.getElementById('addItem').addEventListener('click', function() {
        const tbody = document.getElementById('itemsBody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td><input type="text" placeholder="Item description"></td>
            <td><input type="number" placeholder="0.00" step="0.01"></td>
            <td><input type="number" placeholder="1" value="1"></td>
            <td><span class="amount">0.00</span></td>
            <td><button class="remove-item">×</button></td>
        `;
        tbody.appendChild(newRow);
        
        // Add event listeners to new inputs
        addRowEventListeners(newRow);
    });

    // Remove item functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item')) {
            e.target.closest('tr').remove();
            calculateTotals();
        }
    });

    // Calculate amount when rate or quantity changes
    function addRowEventListeners(row) {
        const rateInput = row.querySelector('td:nth-child(2) input');
        const qtyInput = row.querySelector('td:nth-child(3) input');
        const amountSpan = row.querySelector('.amount');

        function updateAmount() {
            const rate = parseFloat(rateInput.value) || 0;
            const qty = parseFloat(qtyInput.value) || 0;
            const amount = rate * qty;
            amountSpan.textContent = amount.toFixed(2);
            calculateTotals();
        }

        rateInput.addEventListener('input', updateAmount);
        qtyInput.addEventListener('input', updateAmount);
    }

    // Add event listeners to initial row
    const initialRow = document.querySelector('#itemsBody tr');
    if (initialRow) {
        addRowEventListeners(initialRow);
    }

    // Calculate totals
    function calculateTotals() {
        const amounts = Array.from(document.querySelectorAll('.amount'))
            .map(span => parseFloat(span.textContent) || 0);
        
        const subtotal = amounts.reduce((sum, amount) => sum + amount, 0);
        const tax = 0; // 0% tax as per the example
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    // Generate PDF functionality
    document.getElementById('generatePDF').addEventListener('click', async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Company details
        const companyName = document.getElementById('companyName').value;
        const companyStreet = document.getElementById('companyStreet').value;
        const companyCity = document.getElementById('companyCity').value;
        const companyState = document.getElementById('companyState').value;
        const companyZip = document.getElementById('companyZip').value;
        const companyPhone = document.getElementById('companyPhone').value;
        const companyEmail = document.getElementById('companyEmail').value;

        // Invoice details
        const invoiceNumber = document.getElementById('invoiceNumber').value;
        const invoiceDate = document.getElementById('invoiceDate').value;

        // Client details
        const clientName = document.getElementById('clientName').value;
        const clientStreet = document.getElementById('clientStreet').value;
        const clientCity = document.getElementById('clientCity').value;
        const clientState = document.getElementById('clientState').value;
        const clientZip = document.getElementById('clientZip').value;

        // Set font size and type
        doc.setFontSize(20);
        doc.text(companyName, 20, 20);
        
        doc.setFontSize(10);
        doc.text([
            companyStreet,
            `${companyCity}, ${companyState} ${companyZip}`,
            companyPhone,
            companyEmail
        ], 20, 30);

        // Invoice details on the right
        doc.text('INVOICE', 150, 20);
        doc.text([
            `Invoice #: ${invoiceNumber}`,
            `Date: ${invoiceDate}`,
            `Balance Due: $${document.getElementById('total').textContent.substring(1)}`
        ], 150, 30);

        // Bill To section
        doc.setFontSize(12);
        doc.text('BILL TO', 20, 70);
        doc.setFontSize(10);
        doc.text([
            clientName,
            clientStreet,
            `${clientCity}, ${clientState} ${clientZip}`
        ], 20, 80);

        // Items table
        const startY = 110;
        doc.line(20, startY, 190, startY);
        
        // Table headers
        doc.text('DESCRIPTION', 20, startY - 5);
        doc.text('RATE', 120, startY - 5);
        doc.text('QTY', 145, startY - 5);
        doc.text('AMOUNT', 170, startY - 5);

        // Table items
        let currentY = startY + 10;
        document.querySelectorAll('#itemsBody tr').forEach(row => {
            const description = row.querySelector('td:nth-child(1) input').value;
            const rate = row.querySelector('td:nth-child(2) input').value;
            const qty = row.querySelector('td:nth-child(3) input').value;
            const amount = row.querySelector('.amount').textContent;

            doc.text(description, 20, currentY);
            doc.text(rate, 120, currentY);
            doc.text(qty, 145, currentY);
            doc.text(amount, 170, currentY);

            currentY += 10;
        });

        // Totals
        currentY += 10;
        doc.text('SUBTOTAL', 140, currentY);
        doc.text(document.getElementById('subtotal').textContent, 170, currentY);
        
        currentY += 10;
        doc.text('TAX (0%)', 140, currentY);
        doc.text(document.getElementById('tax').textContent, 170, currentY);
        
        currentY += 10;
        doc.line(140, currentY, 190, currentY);
        currentY += 5;
        doc.setFontSize(12);
        doc.text('TOTAL', 140, currentY);
        doc.text(document.getElementById('total').textContent, 170, currentY);

        // Save the PDF
        doc.save(`Invoice-${invoiceNumber}.pdf`);
    });
}); 