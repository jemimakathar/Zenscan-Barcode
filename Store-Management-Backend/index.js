const express = require('express');
const cors = require('cors');
const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
app.use(cors());

const BARCODE_DIR = path.join(__dirname, 'barcodes');
if (!fs.existsSync(BARCODE_DIR)) {
    fs.mkdirSync(BARCODE_DIR);
}


// Generate barcode
app.get('/generate-barcode/:id', (req, res) => {
    const id = req.params.id;
    const type = req.query.type || 'code128';
    const size = req.query.size || 'medium';
    const color = req.query.color || '000000';

    const scaleMap = { small: 1, medium: 2, large: 3 };
    const scale = scaleMap[size] || 2;
    const barcodePath = path.join(BARCODE_DIR, `${id}_${type}_${size}_${color}.png`);

    console.log(`Generating barcode for: ${id} (Type: ${type})`);

    bwipjs.toBuffer({
        bcid: type,// (e.g., code128)
        text: id,
        scale: scale,
        height: 10,
        includetext: true,
        textxalign: 'center',
        backgroundcolor: 'ffffff',
        barcolor: color.replace('#', ''),
    }, (err, png) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error generating barcode', details: err.message });
        }

        fs.writeFile(barcodePath, png, (err) => {   //save the generated barcode image to your filesystem.
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error saving barcode', details: err.message });
            }

            const barcodeUrl = `http://localhost:${PORT}/barcodes/${id}_${type}_${size}_${color}.png`;
            res.json({ barcodeUrl: barcodeUrl });
        });
    });
});

// Serve barcode images
app.use('/barcodes', express.static(BARCODE_DIR));

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
