export type DeliveryKind = 'RUN' | 'WICKET' | 'WIDE' | 'NO_BALL' | 'DOT';
export interface DeliveryNode { kind: DeliveryKind; runs: number; line: number; }
export interface TeamNode { name: string; playerCount: number; roster: string[]; }
export interface OverNode { number: number; bowler: string; deliveries: DeliveryNode[]; line: number; }
export interface InningsNode { battingTeam: string; bowlingTeam: string; openers: [string,string]; overs: OverNode[]; line: number; }
export interface MatchNode { name: string; format: string; oversLimit: number; maxOversPerBowler: number; teams: TeamNode[]; innings: InningsNode; }
export interface Token { type: string; value: string; line: number; column: number; }
