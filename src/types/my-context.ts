import { Context, SessionFlavor } from '../deps.deno.ts';
import { SessionData } from './session-data.ts';

export type MyContext = Context & SessionFlavor<SessionData>;
