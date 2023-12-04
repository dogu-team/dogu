import OpenAI from 'openai';

export module GTP {
  const openai = new OpenAI({
    apiKey: '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',
    organization: 'org-WyY7l0TVzpwkGSKShwNDPTHr',
  });

  export async function run(prompt: string): Promise<any[]> {
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

    const content = chatCompletion.choices[0].message.content;
    if (chatCompletion.choices[0].message.content) {
      const commands = JSON.parse(chatCompletion.choices[0].message.content);
      return commands;
    }

    return [];
  }
}
