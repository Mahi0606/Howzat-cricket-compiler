import type {MatchNode} from '../ast/nodes';
import {HowzatError} from '../errors/compilerError';
export function validateMatch(ast:MatchNode):void {
 const fail=(m:string,l=1):never=>{throw new HowzatError(m,l,1,'Cricket Rule');};
 if(ast.teams.length!==2)fail('A match must define exactly two teams.');
 const [bat,bowl]=ast.teams;
 for(const team of ast.teams){if(!Number.isInteger(team.playerCount)||team.playerCount<2)fail(`${team.name}: PLAYERS must be an integer of at least 2.`);if(team.roster.length!==team.playerCount)fail(`${team.name}: PLAYERS ${team.playerCount} but ${team.roster.length} roster names were provided.`);if(new Set(team.roster).size!==team.roster.length)fail(`${team.name}: player names must be unique.`);}
 if(!bat||!bowl)fail('Both teams are required.');
 const inn=ast.innings;if(!inn.overs.length)fail('An innings must contain at least one OVER.',inn.line);if(inn.battingTeam!==bat.name&&inn.battingTeam!==bowl.name)fail(`Unknown batting team '${inn.battingTeam}'.`,inn.line);
 const batting=ast.teams.find(t=>t.name===inn.battingTeam)!;const bowling=ast.teams.find(t=>t.name===inn.bowlingTeam);
 if(!bowling||bowling.name===batting.name)fail('AGAINST must name the other registered team.',inn.line);
 if(!batting.roster.includes(inn.openers[0])||!batting.roster.includes(inn.openers[1]))fail('Both OPENERS must be registered in the batting team.',inn.line);
 if(inn.openers[0]===inn.openers[1])fail('The two OPENERS must be different players.',inn.line);
 if(!Number.isInteger(ast.oversLimit)||ast.oversLimit<1)fail('OVERS must be a positive integer.',inn.line);
 if(!Number.isInteger(ast.maxOversPerBowler)||ast.maxOversPerBowler<1)fail('MAX_OVERS_PER_BOWLER must be a positive integer.',inn.line);
 if(inn.overs.length>ast.oversLimit)fail(`Innings has ${inn.overs.length} overs, exceeding the ${ast.oversLimit}-over limit.`,inn.line);
 const allDeliveries=inn.overs.flatMap(o=>o.deliveries);let wicketTally=0;
 for(let i=0;i<allDeliveries.length;i++){if(wicketTally>=batting.playerCount-1)fail('Deliveries cannot continue after the innings is all out.');if(allDeliveries[i]!.kind==='WICKET')wicketTally++;}
 const bowlCounts=new Map<string,number>();let prevBowler='';
 inn.overs.forEach((over,index)=>{
  const wicketsAtStart=inn.overs.slice(0,index).flatMap(o=>o.deliveries).filter(d=>d.kind==='WICKET').length;
  if(wicketsAtStart>=batting.playerCount-1)fail(`OVER ${over.number} cannot appear after the innings is all out.`,over.line);
  if(over.number!==index+1)fail(`Overs must be numbered sequentially. Expected OVER ${index+1}, found OVER ${over.number}.`,over.line);
  if(!bowling!.roster.includes(over.bowler))fail(`'${over.bowler}' is not registered in bowling team ${bowling!.name}.`,over.line);
  if(over.bowler===prevBowler)fail(`Bowler '${over.bowler}' cannot bowl consecutive overs.`,over.line);prevBowler=over.bowler;
  const count=(bowlCounts.get(over.bowler)||0)+1;bowlCounts.set(over.bowler,count);
  if(count>ast.maxOversPerBowler)fail(`Bowler '${over.bowler}' exceeds MAX_OVERS_PER_BOWLER ${ast.maxOversPerBowler}.`,over.line);
  let legal=0;
  for(const delivery of over.deliveries){if(legal===6)fail(`OVER ${over.number} contains a delivery after its sixth legal ball. Start a new OVER block.`,delivery.line);if(delivery.kind!=='WIDE'&&delivery.kind!=='NO_BALL')legal++;}
  if(legal>6)fail(`OVER ${over.number} has ${legal} legal deliveries. An over cannot exceed 6 legal balls.`,over.line);
  const wicketsBefore=inn.overs.slice(0,index+1).flatMap(o=>o.deliveries).filter(d=>d.kind==='WICKET').length;
  const allOutAfterThisOver=wicketsBefore>=batting.playerCount-1;
  if(legal!==6 && !allOutAfterThisOver)fail(`OVER ${over.number} has ${legal} legal deliveries. An over must contain 6 legal balls unless the innings ends all out.`,over.line);
  if(wicketsBefore>batting.playerCount-1)fail(`OVER ${over.number} records more than ${batting.playerCount-1} wickets.`,over.line);
 });
}
