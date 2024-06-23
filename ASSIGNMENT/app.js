const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const viewsDir = path.join(__dirname, 'views');


const userDataPath = path.join(__dirname, 'data', 'users.json');
const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));


function serveHtmlFile(res, filePath, placeholders = {}) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading HTML file');
    } else {
      let modifiedData = data;
      for (const [key, value] of Object.entries(placeholders)) {
        modifiedData = modifiedData.replace(new RegExp(`<%= ${key} %>`, 'g'), value);
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(modifiedData);
    }
  });
}


const server = http.createServer((req, res) => {
  const { method, url } = req;

  
  if (url === '/' || url === '/welcome') {
    serveHtmlFile(res, path.join(viewsDir, 'welcome.html'));
    return;
  }

  
  if (url === '/userlist') {
    const userLinks = userData.map(user => `<li><a href="/user/${user._id}">${user.name}</a></li>`).join('');
    serveHtmlFile(res, path.join(viewsDir, 'userlist.html'), { userLinks });
    return;
  }

  
  const userIdRegex = /^\/user\/([\w-]+)$/;
  const match = url.match(userIdRegex);
  if (method === 'GET' && match) {
    const userId = match[1];
    const user = userData.find(u => u._id === userId);
    if (user) {
      serveHtmlFile(res, path.join(viewsDir, 'userdetails.html'), {
        userName: user.name,
        userAge: user.age,
        userEmail: user.email,
        userPhone: user.phone,
        userAddress: user.address,
        userCompany: user.company,
        userBalance: user.balance,
        userAbout: user.about,
      });
      return;
    }
  }

  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
