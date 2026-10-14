// 짝꿍말번역기.html(원본)을 비밀번호로 잠가서 index.html(인터넷에 올릴 잠긴 상자)을 만들어요.
// 사용법: node 잠그기.js 비밀번호
// 비밀번호는 파일 어디에도 저장되지 않아요. 원본을 고친 뒤 다시 실행하면 돼요.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const password = process.argv[2];
if (!password) {
  console.log('비밀번호를 같이 써 주세요: node 잠그기.js 비밀번호');
  process.exit(1);
}

const ITERATIONS = 600000; // 비밀번호를 여러 번 섞어서, 찍어 맞히기 어렵게 만들어요
const dir = __dirname;
const original = fs.readFileSync(path.join(dir, '짝꿍말번역기.html'), 'utf8');

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const locked = Buffer.concat([cipher.update(original, 'utf8'), cipher.final(), cipher.getAuthTag()]);

const b64 = buf => buf.toString('base64');
const page = fs.readFileSync(path.join(dir, '잠금화면.html'), 'utf8')
  .replace('__SALT__', b64(salt))
  .replace('__IV__', b64(iv))
  .replace('__ITER__', String(ITERATIONS))
  .replace('__DATA__', b64(locked));

fs.writeFileSync(path.join(dir, 'index.html'), page);
console.log('잠긴 상자(index.html)를 만들었어요!');
