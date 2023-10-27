import { KnownBlock, WebClient } from '@slack/web-api';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, validateOrReject } from 'class-validator';
import moment from 'moment';
import { NextApiHandler } from 'next';

export class LiveTestingFeedbackDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  liveSessionId!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rate: number | undefined;

  @IsOptional()
  @IsString()
  comment: string | undefined;
}

const handler: NextApiHandler = async (req, res) => {
  if (process.env.DOGU_RUN_TYPE === 'self-hosted') {
    return res.status(404).send('Not Found');
  }

  if (req.method === 'POST') {
    const dto = new LiveTestingFeedbackDto();
    Object.assign(dto, req.body);

    try {
      await validateOrReject(dto);
    } catch (e) {
      res.status(400).json({ message: 'Invalid request body' });
      return;
    }

    const blocks: KnownBlock[] = [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Live testing feedback' },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Date:* ${moment().utcOffset(9).format('YYYY-MM-DD HH:mm:ss')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *User ID*\n${dto.userId}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Live Session ID*\n${dto.liveSessionId}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Rate*\n${dto.rate === undefined ? 'NO RATE' : dto.rate}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• *Message*\n${dto.comment === undefined ? 'NO COMMENT' : dto.comment}`,
        },
      },
    ];

    const client = new WebClient(process.env.DOGU_SLACK_BOT_TOKEN);
    try {
      const result = await client.chat.postMessage({
        text: ' ',
        blocks,
        channel: 'C055LDBUJJF',
      });

      if (result.ok) {
        res.status(200).json({ message: 'OK' });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    } catch (e) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  res.status(404).send('Not Found');
  return;
};

export default handler;
