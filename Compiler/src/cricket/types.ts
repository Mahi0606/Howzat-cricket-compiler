import type {MatchNode} from '../ast/nodes';
export interface BatterStats {name:string; runs:number; balls:number; fours:number; sixes:number; out:boolean; dismissal:string|null; status:'not out'|'out'|'yet to bat';}
export interface BowlerStats {name:string; legalBalls:number; runs:number; wickets:number; wides:number; noBalls:number; maidens:number;}
export interface BallEvent {over:number; ball:number; notation:string; batter:string; bowler:string; runs:number; totalAfter:number; wicketsAfter:number; legal:boolean; note:string;}
export interface OverSummary {over:number; bowler:string; notation:string[]; runs:number; wickets:number; legalBalls:number;}
export interface FallOfWicket {wicket:number; score:number; batter:string; over:string;}
export interface InningsResult {battingTeam:string; bowlingTeam:string; totalRuns:number; wickets:number; legalBalls:number; overs:string; runRate:number; extras:{wides:number;noBalls:number;total:number}; batters:BatterStats[]; bowlers:BowlerStats[]; events:BallEvent[]; overSummaries:OverSummary[]; fallOfWickets:FallOfWicket[]; striker:string|null; nonStriker:string|null; completed:boolean; completionReason:string;}
export interface CompilationResult {success:boolean; matchName?:string; format?:string; tokens?:{type:string;value:string;line:number;column:number}[]; ast?:MatchNode; ir?:string[]; generatedCode?:string; scorecard?:InningsResult; errors:{phase:string;message:string;line:number;column:number}[];}
