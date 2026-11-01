import type {MatchNode} from '../ast/nodes';
import type {BatterStats,BowlerStats,InningsResult,BallEvent,OverSummary} from './types';
const oversText=(balls:number)=>`${Math.floor(balls/6)}.${balls%6}`;
export function simulate(ast:MatchNode):InningsResult {
 const inn=ast.innings, batting=ast.teams.find(t=>t.name===inn.battingTeam)!, bowling=ast.teams.find(t=>t.name===inn.bowlingTeam)!;
 const batters:BatterStats[]=batting.roster.map((name,i)=>({name,runs:0,balls:0,fours:0,sixes:0,out:false,dismissal:null,status:i<2?'not out':'yet to bat'}));
 const bowlers:BowlerStats[]=bowling.roster.map(name=>({name,legalBalls:0,runs:0,wickets:0,wides:0,noBalls:0,maidens:0}));
 const byName=(name:string)=>batters.find(p=>p.name===name)!;
 let striker=inn.openers[0], nonStriker=inn.openers[1];
 const battingQueue=batting.roster.filter(name=>name!==striker&&name!==nonStriker);let nextIndex=0;
 let totalRuns=0,wickets=0,legalBalls=0,wides=0,noBalls=0,completed=false,completionReason='Awaiting remaining overs';
 const events:BallEvent[]=[],overSummaries:OverSummary[]=[],fallOfWickets:InningsResult['fallOfWickets']=[];
 for(const over of inn.overs){if(completed)break;const bowler=bowlers.find(b=>b.name===over.bowler)!;let overRuns=0,overWickets=0,overLegal=0;const notations:string[]=[];
  for(const d of over.deliveries){if(completed)break;const current=byName(striker);const legal=d.kind!=='WIDE'&&d.kind!=='NO_BALL';const notation=d.kind==='WICKET'?'W':d.kind==='WIDE'?'wd':d.kind==='NO_BALL'?'nb':d.kind==='DOT'?'.':String(d.runs);let teamAdd=0,note='';
   if(d.kind==='RUN'){teamAdd=d.runs;current.balls++;current.runs+=d.runs;if(d.runs===4)current.fours++;if(d.runs===6)current.sixes++;}
   else if(d.kind==='DOT'){current.balls++;}
   else if(d.kind==='WICKET'){current.balls++;current.out=true;current.dismissal='bowled';current.status='out';wickets++;overWickets++;bowler.wickets++;fallOfWickets.push({wicket:wickets,score:totalRuns,batter:striker,over:`${Math.floor(legalBalls/6)}.${(legalBalls%6)+1}`});note=`${striker} dismissed (bowled)`;if(nextIndex<battingQueue.length){striker=battingQueue[nextIndex++]!;byName(striker).status='not out';note+=`; ${striker} comes in`;}else{striker='';completed=true;completionReason='All out';}}
   else if(d.kind==='WIDE'){teamAdd=1;wides++;bowler.wides++;note='1 wide extra';}
   else if(d.kind==='NO_BALL'){teamAdd=1;noBalls++;bowler.noBalls++;current.balls++;note='1 no-ball extra';}
   totalRuns+=teamAdd;overRuns+=teamAdd;bowler.runs+=teamAdd;
   if(legal){legalBalls++;overLegal++;bowler.legalBalls++;}
   if(d.kind!=='WICKET' && d.kind!=='WIDE'&&d.kind!=='NO_BALL' && d.runs%2===1){[striker,nonStriker]=[nonStriker,striker];}
   if(legalBalls>=ast.oversLimit*6&&!completed){completed=true;completionReason='Overs limit reached';}
   if(wickets>=batting.playerCount-1&&!completed){completed=true;completionReason='All out';}
   events.push({over:over.number,ball:overLegal,notation,batter:current.name,bowler:bowler.name,runs:teamAdd,totalAfter:totalRuns,wicketsAfter:wickets,legal,note});notations.push(notation);
   if(completed)break;
  }
  if(overLegal===6){[striker,nonStriker]=[nonStriker,striker];}
  if(overLegal===6&&overRuns===0)bowler.maidens++;
  overSummaries.push({over:over.number,bowler:over.bowler,notation:notations,runs:overRuns,wickets:overWickets,legalBalls:overLegal});
 }
 if(wickets>=batting.playerCount-1){completed=true;completionReason='All out';}
 if(legalBalls>=ast.oversLimit*6){completed=true;completionReason='Overs limit reached';}
 const batStats: BatterStats[]=batters.map(p=>({...p,status:(p.out?'out':p.status==='yet to bat'?'yet to bat':'not out') as BatterStats['status']}));
 const result:InningsResult={battingTeam:batting.name,bowlingTeam:bowling.name,totalRuns,wickets,legalBalls,overs:oversText(legalBalls),runRate:legalBalls?Number((totalRuns/(legalBalls/6)).toFixed(2)):0,extras:{wides,noBalls,total:wides+noBalls},batters:batStats,bowlers,events,overSummaries,fallOfWickets,striker:striker||null,nonStriker:nonStriker||null,completed,completionReason};
 return result;
}
