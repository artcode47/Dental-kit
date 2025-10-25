#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = ['schema_22_Kandil.json', 'schema_61_Denta_Carts.json', 'schema_9_Misr_Sinai_For_Supplies.json'];

files.forEach(fileName => {
  const filePath = path.join(__dirname, '..', fileName);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\n📄 ${fileName}:`);
    console.log(`   Total products: ${data.length}`);
    if (data.length > 0) {
      console.log(`   Sample vendorId: ${data[0].vendorId}`);
      console.log(`   Sample brand: ${data[0].brand}`);
    }
  }
});

