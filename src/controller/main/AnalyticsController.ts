// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { address as ipAddress } from 'ip';
import type { AnyData } from '@/types/misc';

//const defaultTracker = 'https://cloud.umami.is/';
// From https://www.whatismybrowser.com/guides/the-latest-user-agent/chrome
const defaultAgent = `Mozilla/5.0 Umami/${process?.version || 1.0}`;

// Return a default mobile or desktop size depending on the User Agent
// https://stackoverflow.com/a/11381730/938236
function sizeFromUA(ua: string) {
  if (!ua) {
    return;
  }

  const reg1 =
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;

  const reg2 =
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i; // eslint-disable-line no-useless-escape

  return reg1.test(ua) || reg2.test(ua.substr(0, 4)) ? '360x720' : '1920x1080';
}

class Umami {
  private websiteId = '91d31f77-5789-42b7-b662-7e499908e926';
  private tracker = 'https://cloud.umami.is';

  private ip: string | null = null;
  private agent: string | null = null;
  private screen: string | null = null;
  private language: string | null = null;

  /**
   * @name constructor
   * @summary Initialize an umami instance with IP, user agent and screen data.
   */
  constructor(ip: string, agent: string, language: string) {
    this.ip = ip;
    this.agent = agent;
    this.language = language;

    const size: '360x720' | '1920x1080' | undefined = sizeFromUA(agent);
    this.screen = size ? String(size) : null;
  }

  /**
   * @name view
   * @summary Track a pageview by passing the path to the function:
   */
  async view(url: string, options: AnyData) {
    return this.send({
      ...options,
      type: 'event',
      url,
    });
  }

  /**
   * @name identify
   * @summary Track a pageview by passing the path to the function:
   */
  async identify(url: string, options: AnyData) {
    return this.send({
      ...options,
      type: 'identify',
      url,
    });
  }

  /**
   * @name event
   * @summary Track an event. Include a `data` property to send event data.
   */
  async event(name: string, options: AnyData) {
    return this.send({
      ...options,
      name,
      type: 'event',
    });
  }

  /**
   * @name send
   * @summary Send data to umami backend and receive a response.
   */
  private async send({ ...opts }: AnyData) {
    const website = this.websiteId;
    const host = this.tracker;
    const userAgent = this.agent || defaultAgent;

    const { type, ...other } = opts;
    const payload = {
      ...other,
      website,
      language: String(this.language),
      screen: String(this.screen),
    };

    const res = await fetch(`${host.replace(/\/$/, '')}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        'X-Forwarded-For': String(this.ip),
      },
      body: JSON.stringify({ type, payload }),
    }).catch((err) => console.error(err.message));

    if (!res || !res.ok) {
      return console.error('Error: ' + (await (res as Response).text()));
    }
  }

  /**
   * @name env
   * @summary Returns an object containing environment variables.
   *
   * Use to get environment variables if necessary.
   */
  private env() {
    const env: AnyData = {};
    if (typeof process !== 'undefined') {
      Object.assign(env, process.env);
    }

    return env;
  }
}

export class AnalyticsController {
  private static umami: Umami | null = null;
  private static enabled = false;

  /**
   * @name initUmami
   * @summary Initialize umami analytics instance.
   */
  static initUmami(agent: string, windowId: string, language: string) {
    if (process.env.DISABLE_ANALYTICS !== undefined) {
      this.enabled = false;
      return;
    }

    console.log(`IP: ${ipAddress()}`);
    this.umami = new Umami(ipAddress(), agent, language);
    this.enabled = true;
    this.umami.view(`/${windowId}`, { data: {} });
    this.umami.identify(`/${windowId}`, { data: {} });
  }

  /**
   * @name umamiTrack
   * @summary Send an umami tracking event.
   */
  static async umamiTrack(event: string, data?: AnyData) {
    if (!this.enabled || !this.umami) {
      return;
    }

    this.umami.event(event, { data: data ? data : {} });
  }
}