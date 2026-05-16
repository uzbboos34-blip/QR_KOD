import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();
  
  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'Form parsing error' });
        return resolve();
      }

      const file = files.fileToUpload;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return resolve();
      }

      try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('fileToUpload', fs.createReadStream(file.filepath));

        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
          headers: formData.getHeaders(),
        });

        res.status(200).send(response.data);
        resolve();
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload to catbox failed' });
        resolve();
      }
    });
  });
}
