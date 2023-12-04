/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */

import OpenAI from 'openai';
import { promisify } from 'util';

const openai = new OpenAI({
  apiKey: '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',
  organization: 'org-WyY7l0TVzpwkGSKShwNDPTHr',
});

const wait = promisify(setTimeout);

(async () => {
  const data: { xpath?: string; text?: string; t?: string }[] = [
    {
      xpath: '//html[1]/body[1]/div[1]/div[1]/a[1]',
      text: '본문 바로가기',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/header[1]/div[1]/a[1]/h1[1]',
      text: 'NAVER',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/ul[1]/li[1]/a[1]/span[1]/span[1]',
      text: 'ID 로그인',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/ul[1]/li[2]/a[1]/span[1]/span[1]',
      text: '일회용 번호',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/ul[1]/li[3]/a[1]/span[1]/span[1]',
      text: 'QR코드',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[1]/div[1]/div[1]/span[1]/span[1]',
      text: '아이디',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[1]/div[1]/input[1]',
      text: '아이디',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[1]/div[2]/div[1]/span[1]/span[1]',
      text: '비밀번호',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[1]/div[2]/input[1]',
      text: '비밀번호',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[2]/div[1]/label[1]',
      text: '로그인 상태 유지',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[2]/div[2]/a[1]/span[1]',
      text: 'IP보안',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[2]/div[2]/span[1]/label[1]/span[1]',
      text: 'on',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/div[1]/form[1]/ul[1]/li[1]/div[1]/div[7]/button[1]/span[1]',
      text: '로그인',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/ul[1]/li[1]/a[1]',
      text: '비밀번호 찾기',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/ul[1]/li[2]/a[1]',
      text: '아이디 찾기',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[2]/div[1]/ul[1]/li[3]/a[1]',
      text: '회원가입',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/ul[1]/li[1]/a[1]/span[1]',
      text: '이용약관',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/ul[1]/li[2]/a[1]/span[1]/strong[1]',
      text: '개인정보처리방침',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/ul[1]/li[3]/a[1]/span[1]',
      text: '책임의 한계와 법적고지',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/ul[1]/li[4]/a[1]/span[1]',
      text: '회원정보 고객센터',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/div[1]/a[1]/span[1]/span[1]',
      text: '네이버',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/div[1]/span[1]',
      text: 'Copyright',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/div[1]/span[2]',
      text: '© NAVER Corp.',
    },
    {
      xpath: '//html[1]/body[1]/div[1]/div[3]/div[1]/div[1]/span[3]',
      text: 'All Rights Reserved.',
    },
  ];

  for (const item of data) {
    item.t = item.text;

    delete item.xpath;
    delete item.text;
  }

  const prompt = `
  사이트에서 로그인을 진행하고, '펄어비스' 주식에 관한 '종합 토론방'에서 글을 작성하는 과정을 자동화합니다.

  현재 사이트의 Xpath와 UI 텍스트 항목: 
  ${JSON.stringify(data)}
  `;

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    response_format: {
      type: 'json_object',
    },
    messages: [
      {
        role: 'system',
        content: `Request: Please create a JSON array of all automation commands that can be generated on the current site. When you're done generating commands, we'll perform them and ask for the next ones.
        Generation rules: You must output all possible commands, and they must be based on the provided Text items. We will only generate commands that fit the structure of the current site, and we will not generate commands that use non-existent Text or are based on predictions.
        Example JSON format: {type: 'click', text: 'div'}, {type: 'input', text: 'div', value: 'any'}, {type: 'enter', text: 'div'}`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  console.log(chatCompletion);
  //@ts-ignore
  const message = JSON.parse(chatCompletion.choices[0].message.content);

  const prompt2 = `
  {
    "xpath": "//html[1]/body[1]/div[1]/a[1]/span[1]",
    "text": "메인 메뉴로 바로가기"
  },
  {
    "xpath": "//html[1]/body[1]/div[1]/a[2]/span[1]",
    "text": "본문으로 바로가기"
  },
  {
    "xpath": "//html[1]/body[1]/div[2]/div[1]/div[1]/div[1]/h1[1]/a[1]/span[1]",
    "text": "네이버"
  },
  {
    "xpath": "//html[1]/body[1]/div[2]/div[1]/div[1]/div[1]/h1[1]/a[2]/span[1]",
    "text": "페이"
  },
  {
    "xpath": "//html[1]/body[1]/div[2]/div[1]/div[1]/div[1]/h1[1]/a[3]/span[1]",
    "text": "증권"
  },
  {
    "xpath": "//html[1]/body[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/label[1]",
    "text": "증권 종목명·지수명 검색"
  },
  {
    "xpath": "//html[1]/body[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/input[1]",
    "text": "종목명·지수명 입력"
  },
  {
    "xpath": "//html[1]/body[1]/div[2]/div[1]/div[1]/div[2]/div[1]/form[1]/button[1]/span[1]",
    "text": "검색"
  },
  `;

  const chatCompletion2 = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    response_format: {
      type: 'json_object',
    },
    messages: [
      {
        role: 'system',
        content: `Request: Please create a JSON array of all automation commands that can be generated on the current site. When you're done generating commands, we'll perform them and ask for the next ones.
        Generation rules: You must output all possible commands, and they must be based on the provided Xpath and UI text items. We will only generate commands that fit the structure of the current site, and we will not generate commands that use non-existent Xpaths or are based on predictions.
        Example JSON format: {type: 'click', xpath: 'div'}, {type: 'input', xpath: 'div', value: 'any'}, {type: 'enter', xpath: 'div'}`,
      },
      {
        role: 'system',
        content: `지금 테스트 목적은 "사이트에서 로그인을 진행하고, '펄어비스' 주식에 관한 '종합 토론방'에서 글을 작성하는 과정을 자동화합니다." 입니다.`,
      },
      {
        role: 'system',
        content: `이전 답변 기록 ${chatCompletion.choices[0].message.content}`,
      },
      {
        role: 'user',
        content: prompt2,
      },
    ],
  });

  //@ts-ignore
  const message2 = JSON.parse(chatCompletion2.choices[0].message.content);
  console.log(message2);
})();
