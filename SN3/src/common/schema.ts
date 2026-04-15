import { object, z } from 'zod';
import net from 'net';

const httpSchema = z.union([ z.literal('http'), z.literal('https') ]);
const turnSchema = z.union([ z.literal('turn'), z.literal('turns') ]);
const protocolSchema = z.union([ z.literal('tcp'), z.literal('udp') ]);

const ipString = z
	.string()
	.nullable()
	.transform((val) => val ?? '0.0.0.0')
	.refine((val) => net.isIP(val) !== 0, {
		message: 'Invalid IP address (must be IPv4 or IPv6)',
	});

export const AppConfigSchema = z.object({
	liveReload: z.boolean().optional(), // TODO add default true after other getConfig is replaced?
	redis: z.object({
		host: z.string(),
		port: z.number(),
		password: z.string()
	}),
	
});
export type AppConfigParsed = z.infer<typeof AppConfigSchema>;
