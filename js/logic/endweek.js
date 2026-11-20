'use strict';
/* =====================================================================
   END OF WEEK (endWeek: Sam's focus, every house's nights via simHouse, guild, events, debt, rest day)
   ===================================================================== */
function endWeek(){
  if(!S || S.over || EVQ.length) return;
  closeModal();
  S.workers.forEach(ensureWorker);
  goddessPlan();   // her actions this week (goddess.js), before the houses run
  guildTidy();     // guild.js: ladies (and Sam's focus) on contracts that ended go back to work
  const attLines = syncAttendants();   // spare attendants stand in for absent courtesans or rest, and go back to attending when they return
  const focusLine = samFocusRun();   // Sam's weekly focus (focus.js): pays its energy, sets what simHouse reads
  const R = {v3:true, v5:true, v6:true, week:S.week, lines:[], per:{}, hl:[], houses:[], income:0, wages:0, upkeep:0, recharge:0, cuts:0, served:0, turned:0, left:0, stopped:0, selfProps:0,
    led:{escort:0, offduty:0, bar:0, dance:0, bath:0, chapel:0, host:0, guild:0, office:0, sam:S.samWeek.income}, samActs:S.samWeek.acts.slice()};
  S.workers.forEach(w=>R.per[w.id]={id:w.id, name:w.name, job:w.job, prevJob:w.job==='rest' ? w.prevJob : undefined, standIn:w.standIn || undefined, house:w.house, served:0, comp:0, acts:{}, props:0, acc:0, earned:0, e0:Math.round(w.energy), m0:Math.round(w.mood), l0:Math.round(w.lust||0), enc:[], why:[], notes:[],
    t0:w.trust||0, lw0:w.lewd||0, p0:w.popularity||0, st0:Object.assign({}, w.stats), tk0:Object.assign({}, w.tech), ak0:Object.fromEntries(Object.entries(w.acts||{}).map(([k,a])=>[k, a.skill||0]))});
  const log = t => R.lines.push(t);
  if(focusLine) log(focusLine);
  attLines.forEach(log);
  autoFeasts(R);   // home.js: houses set to feast automatically, before the work week
  autoStuds(R);    // sam.js: auto-hire studs for demons whose lust meets their threshold
  let satSum = 0;
  S.houses.forEach(h=>{ const hr = simHouse(h, R); const oe = focusOn('office', h); if(oe && hr.income > 0){ const ob = Math.round(hr.income * officeMul() * oe); hr.income += ob; hr.office = ob; R.led.office += ob; }
    R.houses.push(hr); R.income += hr.income; R.upkeep += hr.upkeep; R.served += hr.served; R.turned += hr.turned; R.left += hr.left||0; R.stopped += hr.stopped||0; satSum += hr.sat; });
  if(R.samWomen) log(`💋 ${R.samWomen} wom${R.samWomen===1?'an':'en'} nobody else would take propositioned Sam on the floor, and he obliged (fees in his column, a little renown; see Sam's week in the report).`);
  guildWeek(R);   // guild.js: contract progress, injuries, rewards (adds to R.income)
  R.perkBonus = Math.round(R.income * ((hasChallengePerk('lean_house') ? 0.1 : 0) + (hasChallengePerk('starlight_debt') ? 0.15 : 0)));
  R.income += R.perkBonus;
  R.wages = S.workers.reduce((a,w)=>a+(isFree(w)?0:w.wage), 0);
  S.workers.forEach(w=>{ const pr = R.per[w.id], cut = workerCut(w), cg = pr.earned>0 && cut>0 ? Math.round(pr.earned * cut) : 0; pr.cut = cg; if(cg){ w.purse = (w.purse||0) + cg; R.cuts += cg; } });
  S.gold += R.income - R.wages - R.upkeep - R.cuts;
  tutorWeek(R);
  challengeTrack();   // random.js: cycle-long challenge goals (average tidiness, largest staff)

  const leaving = [], renew = [];
  S.workers.forEach(w=>{
    const pr = R.per[w.id], h = houseOf(w), hrw = R.houses.find(x=>x.id===w.house), tfx = hrw && hrw.tidyFx;
    const mad = S.workers.find(x=>x.house===w.house && x.job==='madame');
    // The rest day (balance.json → rest): workers already slept after each night (nightRest); the day off adds rest.restDay x her bed.
    // A week off (job 'rest') sleeps the whole week instead: rest.week x bed, plus the bath.
    const mx = maxEnergy(w);
    let rest = (w._bed ?? BEDS[h.beds||0].rest);
    rest *= restMult(w) * (tfx ? tfx.rec : 1);
    const RB = BAL.rest || {};   // balance.json → rest
    let rec = w.job==='rest' ? rest*(RB.week ?? 1.6) + (h.up.bath ? (RB.bath ?? 10) : 0) : rest*(RB.restDay ?? 0.5);
    // wear (balance.json → rest.wear): each work night costs a little Health (nightRest), and a worn-down lady recovers less (fatigueCut).
    // A week off heals it. Demons (they feed) and androids (they charge) don't wear down this way.
    const WR = RB.wear || {};
    if(w.job!=='rest' && !['demon','android'].includes(w.race) && WR.per){ const cut = fatigueCut(w); rec *= 1 - cut; pr.fatigue = Math.round(cut*100); }
    if(w.race==='demon') rec = w.job==='rest' ? rec*(SVC.demon.restMult ?? 0.7) : -SVC.demon.hunger;   // demons don't sleep and burn hunger every working week: they feed on desire instead (serveAct); on a week off, on men in town
    if(w.race==='demon' && w.job==='rest' && restless(w) && Math.random() < SVC.demon.restDrainChance){   // a restless one can overdo it, and the town notices
      S.rep = clamp(S.rep - SVC.demon.restRepDrain); pr.drains = (pr.drains||0)+1; (pr.notes = pr.notes||[]).push(flavor('rest_demon_drain', w));
      log(`😈 ${w.name} fed a little too hard on her week off. Talk around town is not kind (reputation −${SVC.demon.restRepDrain}).`); }
    const e0 = w.energy;
    if(w.race==='android') rec = Math.max(rec, maxEnergy(w) - w.energy);   // androids plug in every night and charge to full (for a fee, counted with the nights' charging)
    pr.eWork = Math.round(pr.e0 - e0 + (pr.eNight||0) + (pr.charged||0)); w.energy += rec; pr.eRec = Math.round(w.energy - e0); pr.eNight = Math.round((pr.eNight||0) + (pr.charged||0)); pr.slept = w._bed===FLOOR_REST ? 'floor' : w.race==='spirit' ? 'spirit' : w.race==='android' ? 'charging' : w.race==='demon' ? 'none' : BEDS[h.beds||0].label;
    if(w.race==='android'){ const got = Math.max(0, Math.min(w.energy, energyCap(w)) - e0) + (pr.charged||0), A = SVC.android;
      if(got > 0){ const fee = Math.round((A.fee + A.perEnergy*got) * (h.up.charger ? 1 - A.chargerDiscount : 1) * housePerkVal(h, 'chargeMult', 1)); S.gold -= fee; R.recharge += fee; pr.recharge = fee; } }
    const why = (t, good) => pr.why.push({t, good});
    if(w.job!=='rest'){ countUp(w,'weeksWorked'); countUp(w,'jobWeeks.'+w.job); }
    if(pr.favN) why('got to do her favorite', true);
    if(pr.eagerN) why('was in the mood for her clients', true);
    if(pr.disN) why('had to do things she dislikes', false);
    if(pr.reluct) why('did a few things as a favor', false);
    if(w.job==='rest'){ moodAdd(w, 8); w.health += (RB.wear||{}).restHeal ?? 15; why('a week off', true); }
    if((pr.fatigue||0) >= 20) why(`worn down from weeks without a break (health ${Math.round(w.health)}, recovery −${pr.fatigue}%)`, false);
    if(h.up.garden) w.health += BAL.amenities.garden.health * gardenMult(w);   // the garden mends a little wear every week
    w.health = clamp(w.health);
    if(w._bed===FLOOR_REST && !['spirit','android'].includes(w.race)){ moodAdd(w, -3); why('slept on the floor', false); }
    else if(housingShort(h) && !['spirit','android','demon'].includes(w.race)){ moodAdd(w, -BAL.quarters.moodPer*housingShort(h)); why('expects better quarters in a house of this prestige', false); }
    if(!(isVessel(w) && vesselStage(w) < 1)) w.mood += (BAL.mood.restingPoint + fxAdd(w,'moodRest') + (has(w,'Loyal')?5:0) + (has(w,'Devoted')?10:0) - w.mood) * BAL.mood.drift * fxMul(w,'moodDrift');
    if(townAdd('mood', 0)) moodAdd(w, townAdd('mood', 0));
    const extraAcc = Math.max(0, pr.acc - Math.max(0, pr.served - pr.comp));
    const work = pr.served + extraAcc - pr.comp*0.4, tol = pr._overTol ?? BAL.mood.overworkAt, shield = pr._overShield ?? 0;
    const over = Math.max(0, work - tol) * (1 - shield);
    if(over >= 0.8){ moodAdd(w, -over*(has(w,'Lazy')?5:2.5)); why(over>3 ? 'badly overworked' : 'a bit overworked', false); }
    if(!isFree(w) && w.wage < wageFor(w)*0.9){ moodAdd(w, -4); why('feels underpaid', false); }
    if(jobLikes(w).includes(w.job)){ moodAdd(w, 3); why('likes her job', true); } else if(jobDislikes(w).includes(w.job)){ moodAdd(w, -3); why("doesn't like her job", false); }
    if(mad && w!==mad) moodAdd(w, 3);
    if(tfx){ moodAdd(w, tfx.mood); why(tfx.mood > 0 ? 'a spotless house' : 'a grubby house', tfx.mood > 0); }
    if(pr.accProp && !(JOBS[w.job]||{}).must && w.job!=='chapel') why(`propositions took ${Math.round((1-outputMult(w,pr))*100)}% of her work time`, false);
    if(pr.noRoom) why('no free room for a client', false);
    if(pr.offMood) why('worked while not in the mood', false);
    if(h.up.bath) moodAdd(w, 3);
    Object.keys(h.up).forEach(k=>{ const u = UPGRADES[k]; if(h.up[k] && u && u.race===w.race && u.mood) moodAdd(w, u.mood); });   // race houses (tether, chapel)
    if(h.up.garden) moodAdd(w, BAL.amenities.garden.mood * gardenMult(w));
    const houseMood = housePerkVal(h, 'moodRest', 0) + incenseAdd(w, 'mood') + ((hrw && hrw.chapelMood) || 0);
    if(houseMood) moodAdd(w, houseMood);
    const o = getOutfit(w); if(o.style===w.style){ moodAdd(w, 3); why('loves her outfit', true); }
    if(has(w,'Greedy') && pr.earned>250){ moodAdd(w, 4); why('made good money', true); }
    if(pr.earned > 0 && !isFree(w)){
      const cut = workerCut(w), base = baselineCut(), C = BAL.wardrobe.cut, gm = has(w,'Greedy') ? C.greedyMult : 1;
      if(cut < base){
        const ratio = (base - cut) / Math.max(0.05, base);
        moodAdd(w, -Math.max(1, Math.round(C.moodPenalty * ratio * gm)));
        w.trust -= Math.max(0.2, +(C.trustPenalty * ratio).toFixed(2));
        why(cut <= 0 ? 'no profit cut' : 'small profit cut', false);
      }
    }
    if(w.autoDress && autoDressPool(w).length > 1){
      const AD = BAL.wardrobe.autoDress;
      moodAdd(w, AD.mood); w.trust += AD.trust * fxMul(w,'trustGain');
      why('chooses her own clothes', true);
    }
    if(w.energy <= 5 && w.race!=='demon'){ w.health -= 15; moodAdd(w, -10); why('exhausted', false); log(`⚠️ ${w.name} is exhausted. Give her some rest.`); }
    let boughtOutfit = false;
    // Spend weekly profit cut (using up the budget each week unless saving briefly for an outfit within reach)
    const spendBudget = (budget, noOutfit) => {
      if(budget <= 0) return;
      const act = cutSpendPick(w, budget, pr.cut||0, noOutfit);
      if(act === 'outfit'){
        const {afford} = wantedOutfits(w, budget);
        if(afford.length){
          const [bk, bo] = pick(afford), bc = outfitCost(bo);
          w.owned = w.owned || []; if(!w.owned.includes(bk)) w.owned.push(bk);
          if(w.autoDress || !wardrobeOK(w, w.outfit)) w.outfit = bk;
          boughtOutfit = true;
          moodAdd(w, bo.style===w.style ? 5 : 2);
          why(`bought ${bo.label}`, true);
          log(`🛍️ ${w.name} spent ${fmt(bc)} from her cut on ${bo.label}${w.outfit===bk?' and put it on':''}.`);
          pr.notes.push(`Bought ${bo.label} (${fmt(bc)})`);
          const left = budget - bc;
          w.purse = 0;
          if(left >= 5) spendBudget(left, true);
          return;
        }
        w.purse = budget;
        pr.notes.push(`Saved ${fmt(budget)} toward an outfit`);
        return;
      }
      w.purse = 0;
      if(act === 'massage'){
        const eg = Math.round(clamp(budget / 5, 4, 28));
        w.energy += eg;
        why('got a massage', true);
        pr.notes.push(`Spent ${fmt(budget)} on a massage (+${eg} energy)`);
      } else if(act === 'nice'){
        const mg = Math.round(clamp(budget / 9, 2, 12)), tg = +(clamp(budget / 110, 0.15, 1.5)).toFixed(2);
        moodAdd(w, mg); w.trust += tg * fxMul(w,'trustGain');
        why('treated herself to nice things', true);
        pr.notes.push(`Bought herself nice things (${fmt(budget)}: +mood, +trust)`);
      } else if(act === 'fling'){
        const mg = Math.round(clamp(budget / 10, 2, 10)), ld = spendLust(w, Math.round(clamp(budget / 4, 6, 32)));
        moodAdd(w, mg);
        why('went out for a good time', true);
        pr.notes.push(`Spent ${fmt(budget)} on a night out with a guy (lust −${ld}, +mood)`);
      } else if(act === 'lessons'){
        const xp = clamp(+(budget / 45).toFixed(2), 0.35, 2.2), sts = trainStatsOf(w).slice(0, 2);
        if(sts.length){ const tot = sts.reduce((a,x)=>a+x[1],0)||1; sts.forEach(([k,wt])=>statXP(w, k, xp*(wt/tot))); }
        else statXP(w, 'charm', xp);
        why('paid for extra lessons', true);
        pr.notes.push(`Paid ${fmt(budget)} for extra lessons (+stats)`);
      } else if(act === 'treat'){
        const mates = S.workers.filter(x=>x!==w && x.house===w.house), other = pick(mates);
        if(other){
          const bg = Math.round(clamp(budget / 30, 1, 3));
          addBond(w, other, bg); moodAdd(w, 2); moodAdd(other, 2); w.trust += 0.2 * fxMul(w,'trustGain');
          why(`treated ${other.name.split(' ')[0]}`, true);
          pr.notes.push(`Treated ${other.name.split(' ')[0]} (${fmt(budget)}: +bond, +mood)`);
        }
      } else if(act === 'pamper'){
        const xp = clamp(+(budget / 65).toFixed(2), 0.25, 1.4), pg = clamp(+(budget / 110).toFixed(1), 0.2, 1.4);
        statXP(w, pick(['beauty','charm']), xp); w.popularity = clamp(w.popularity + pg); moodAdd(w, 2);
        why('spent on grooming & scent', true);
        pr.notes.push(`Salon & grooming (${fmt(budget)}: +stat, +popularity)`);
      } else {
        const temple = has(w,'Devout') || w.personality==='Devout and serene';
        pr.notes.push(temple ? `Tithed ${fmt(budget)} to her temple` : `Sent ${fmt(budget)} home`);
      }
    };
    if((w.purse||0) > 0) spendBudget(Math.round(w.purse), false);
    w.energy = clamp(w.energy, 0, energyCap(w)); w.mood = clamp(w.mood); w.health = clamp(w.health);
    if(w.race==='demon' && w.energy <= 5 && w.job!=='rest') log(`${w.name} is running on fumes. She needs clients to feed on, or time off.`);
    if(has(w,'Devoted')) w.mood = Math.max(w.mood, 45);
    if(w.mood>65) w.trust += 0.5 * fxMul(w,'trustGain');
    if(w.mood<30 && !has(w,'Loyal') && !isFree(w)) w.trust -= 2;
    w.trust = clamp(w.trust); capTrust(w);
    if(w.health<30 && w.job!=='rest'){ w.job='rest'; log(`🤒 ${w.name} is unwell and will rest next week.`); }
    if(w.job!=='rest' && w.trust < jobTrust(w,w.job) - 5){ log(`${w.name} doesn't trust Sam enough to keep working as ${JOBS[w.job].label} and stepped down.`); w.job='rest'; delete w.prevJob; }
    const dropped = w.menu.filter(a=>!canClient(w,a));
    if(dropped.length){ w.menu = w.menu.filter(a=>canClient(w,a)); log(`${w.name} took ${dropped.map(actLabel).join(', ')} off her menu for now.`); }
    if(w.job==='courtesan' && !getActs().some(a=>canClient(w,a.id))){ w.job = safeJob(w, 'attendant'); log(`${w.name} isn't comfortable offering services right now and moved to ${(JOBS[w.job]||{label:'rest'}).label} work.`); }
    if(!wardrobeOK(w,w.outfit)){ w.outfit = ownedOutfits(w).find(k=>wardrobeOK(w,k)) || w.outfit; log(`${w.name} changed into something she's more comfortable in.`); }
    if(!underOK(w,w.under)){ w.under='plain'; }
    if(!boughtOutfit && w.autoDress && autoDressPool(w).length > 1){
      const np = autoDressPick(w);
      if(np && np !== w.outfit){
        w.outfit = np;
        pr.notes && pr.notes.push(`Dressed herself in ${WARDROBE[np].label}`);
      }
    }
    // auto-rest
    if(w.autoRest){
      if(w.job!=='rest' && (w.energy < maxEnergy(w)*0.35 || wornDown(w))){ log(`😴 ${w.name} is ${w.energy < maxEnergy(w)*0.35 ? 'worn out' : 'worn down after weeks without a break'} and will rest next week.`); w.prevJob = w.standIn ? 'attendant' : w.job; delete w.standIn; w.job = 'rest'; }
      else if(w.job==='rest' && w.prevJob && !w.idleRest && w.energy >= maxEnergy(w)*0.85){ const pj = w.prevJob; delete w.prevJob; const no = canDo(w,pj); if(!no){ w.job = pj; log(`💪 ${w.name} is rested and back to work as ${JOBS[pj].label}.`); } else log(`${w.name} is rested but can't go back to ${JOBS[pj].label} (${no}) Give her a job.`); }
    }
    // how she took the week's clients, by personality (data/personalities.json goodNight/badNight, flavor good_night/bad_night)
    if(pr.served >= 2){
      const avg = pr.satSum/pr.served, P = PERS[w.personality]||{};
      const kind = avg>=72 && !pr.low ? 'good' : (pr.low>=2 || avg<38) ? 'bad' : null;
      if(kind){ moodAdd(w, kind==='good' ? (P.goodNight??3) : (P.badNight??-3)); pr.night = kind; why(kind==='good' ? 'her clients loved her' : 'difficult clients', kind==='good');
        if(Math.random()<0.6) R.hl.push({wid:w.id, text:flavor(kind+'_night', w), act:null, scene:'casual'}); }
    }
    // lust builds up, and is spent by services and time with Sam
    // (services and Sam's time already spent it as they happened; see spendLust)
    w.lust = w.lust + lustProfile(w).build; fitLust(w);
    if(w._samTime) why('spent time with Sam', true);
    if(has(w,'Devoted') && !w._samTime && restless(w)){ why('missed Sam', false); moodAdd(w, -BAL.lovers.missedMood); pr.missed = true; }
    if(has(w,'Devoted')) w.neglect = w._samTime ? 0 : (w.neglect||0) + 1;   // weeks in a row without Sam
    w._samTime = 0; pr.lust = Math.round(w.lust);
    pr.e1 = Math.round(w.energy); pr.m1 = Math.round(w.mood);
    // what changed this week (report: house and lady pages drill into it)
    pr.t1 = w.trust||0; pr.lw1 = w.lewd||0; pr.p1 = w.popularity||0;
    const dif = (a, b) => Object.fromEntries(Object.keys(b||{}).map(k=>[k, Math.round(((b[k] && b[k].skill!==undefined ? b[k].skill : b[k])||0) - ((a||{})[k]||0))]).filter(([,v])=>v));
    pr.dStats = dif(pr.st0, w.stats); pr.dTech = dif(pr.tk0, w.tech); pr.dActs = dif(pr.ak0, w.acts);
    pr.lowE = JOBS[w.job] && JOBS[w.job].cat==='escort' && pr.cap!==undefined && pr.served < pr.cap && (pr.lowNights||0) > 0;
    delete pr.st0; delete pr.tk0; delete pr.ak0;
    w.earnedLast = pr.earned;
    if(w.mood<15 && !has(w,'Loyal') && !isFree(w) && !w.locked && !has(w,'Devoted')){ w.unhappy=(w.unhappy||0)+1; if(w.unhappy>=2) leaving.push(w); else log(`😠 ${w.name} is miserable. If nothing changes, she'll leave.`); }
    else w.unhappy = 0;
    if(!isFree(w) && !w.locked){ w.contract--; if(w.contract<=0 && !leaving.includes(w)) renew.push(w); }
    const enc = pr.enc.slice().sort(()=>Math.random()-0.5).sort((a,b)=>(b.act?2:b.want?0:1)+(b.reg?2:0)-(a.act?2:a.want?0:1)-(a.reg?2:0));
    // every encounter goes in the report (her own page lists them all); the first two are her highlights on the house page (more: false)
    pr.encN = enc.length; pr.encSum = enc.reduce((a,e)=>{ a[e.act ? 'svc' : e.want && e.outcome==='no' ? 'no' : 'comp']++; return a; }, {svc:0, no:0, comp:0});
    enc.slice(0,30).forEach((e,i)=>R.hl.push({wid:w.id, text:(t => e.csex ? toHer(t) : t)(hlText(w,e) + (e.note ? ' ' + ENC_NOTE(e.note) : '')), act:e.act||null, cls:e.cls, note:e.note||null, more:i>=2, fee:e.fee, d:e.d, sat:e.sat, outcome:e.outcome, where:e.where||null, chapelProp:!!e.chapelProp, sample:!!e.sample, adapt:!!e.adapt, spiritFuta:!!e.spiritFuta, beastHeat:!!e.heat, csex:e.csex||null, scene: e.act && e.possess ? 'spirit_futa' : e.act && e.csex ? `cpair:${e.act}:${e.csex==='futa' ? 'futa' : 'fem'}~${e.expr||''}~${e.ctx||''}` : e.act ? 'act:'+e.act+'~'+(e.expr||'')+'~'+(e.ctx||'') : e.where ? 'job_'+e.where : 'companion'}));
    delete pr.enc;
    earnCheck(w).forEach(t=>{ log(`✨ ${w.name} has developed a knack: ${t}. ${TRAITS[t].desc}`); addLog(`${w.name} developed the trait ${t}.`); });
    titleCheck(w).forEach(log);
    // Lantern Angel: once her lewdness reaches lanternLewd the Lamplighter's sanction is hers to take.
    // With enough trust (lanternTrust) she asks Sam first. Otherwise her personality decides: an easygoing one
    // (personality lewd multiplier >= 1, not Modest) takes it on her own; a reserved one holds to her vows until
    // she trusts Sam enough to ask, or her lewdness climbs lanternOwn past the threshold and she stops resisting.
    const AN = SVC.angel || {}, LL = AN.lanternLewd ?? 60;
    if(w.race==='angel' && w.sub!=='lantern' && !w.lanternDecided && w.lewd >= LL){
      const wid = w.id;
      if(w.trust >= (AN.lanternTrust ?? 50)){ w.lanternDecided = true; EVQ.push(()=>evLanternAsk(findW(wid))); }
      else if((((PERS[w.personality]||{}).lewd ?? 1) >= 1 && !has(w,'Modest')) || w.lewd >= LL + (AN.lanternOwn ?? 15)){
        w.lanternDecided = true; w.sub = 'lantern'; w.lantern = true; fitLust(w); moodAdd(w, AN.lanternAutoMood ?? 6);
        log(`🕯️ ${w.name} took the Pleasure Lantern's sanction on her own and became a Lantern Angel.`);
        EVQ.push(()=>evLanternSelf(findW(wid)));
      } else if(!w.lanternHeld){
        w.lanternHeld = true;
        log(`🕯️ ${w.name} feels the Pleasure Lantern's pull and is holding to her vows for now. She may ask Sam about it once she trusts him more (trust ${tShow(AN.lanternTrust ?? 50)}).`);
      }
    }
    // romance arcs
    if(ARCS[w.key] && (w.arc||0) < ARCS[w.key].length && !houseGate(w)){
      const i = w.arc||0, A = BAL.arcs, need = A.need[i], gap = paidGap(A.gap[i]);
      const extra = i===2 ? ((w.dates||0)>=A.dates[2] || (w.privateCount||0)>=1) : i===4 ? (w.dates||0)>=A.dates[4] : i===5 ? (w.privateCount||0)>=A.private[5] : true;
      if(w.trust>=need && S.week-(w.arcWk||0) >= gap && extra){ const at = i; EVQ.push(()=> (w.arc||0)===at ? evArc(w) : null); }
    } else if(typeof afterReady==='function'){
      const ai = afterReady(w);
      if(ai >= 0){ EVQ.push(()=> (w.after||0)===ai ? evAfterStory(w) : null); }
    }
  });
  leaving.forEach(w=>{ stashCloset(w); S.workers = S.workers.filter(x=>x!==w); log(`🚪 ${w.name} packed her things and left.`); addLog(`${w.name} quit.`); });

  (R.houses||[]).forEach(hr=>{
    if(hr.short) log(`🚪 ${flavor('rooms_short', null, {house:hr.name})} (${hr.short} client${hr.short>1?'s':''} couldn't get a room; ${hr.roomsUsed}/${hr.roomCap} room sessions used.)`);
    if(hr.crowdOver) log(`👥 ${hr.name} was overcrowded (${hr.guestsIn}/${hr.crowdCap} guests inside — +${hr.crowdOver} over house capacity; satisfaction, popularity and prestige suffered).`);
    const T = BAL.tidy, tk = hr.tidy >= T.high ? 'high' : hr.tidy < T.bad ? 'bad' : hr.tidy < T.low ? 'low' : null;
    if(tk) log(`${tk==='high'?'✨':'🧹'} ${flavor('tidy_'+tk, null, {house:hr.name})} (tidiness ${Math.round(hr.tidy)})`);
    if(hr.classroom) log(`📚 Classroom: ${hr.classroom.teacher} taught ${hr.classroom.subject.toLowerCase()} to ${hr.classroom.n} lad${hr.classroom.n===1?'y':'ies'}.`);
    const pu = hr.pushy; if(pu && pu.total) log(`⚠️ ${hr.name}: ${pu.total} pushy client${pu.total>1?'s':''}${hr.nightsLost?` (${hr.nightsLost} night${hr.nightsLost>1?'s':''} cut short)`:''}. ${[pu.talked&&`talked down ${pu.talked}×`, pu.security&&`security walked ${pu.security} out`, pu.sam&&`Sam stepped in ${pu.sam}×`, pu.samfail&&`Sam's attempt went badly ${pu.samfail}×`, pu.samcall&&`security needed Sam ${pu.samcall}× (your call)`, pu.none&&`nobody was there ${pu.none}×`].filter(Boolean).join(', ')}.`);
  });
  (R.houses||[]).forEach(hr=>{ if(hr.floor && hr.floor.length) log(`🛏️ ${hr.name} is short on beds: ${hr.floor.join(', ')} slept on the floor. Build staff quarters or add staff beds.`); });
  R.avgSat = R.served ? satSum/R.served : 50;
  const avgRep = S.houses.reduce((a,h)=>a+h.rep,0)/S.houses.length, maxRep = Math.max(...S.houses.map(h=>h.rep));
  S.rep = clamp(S.rep + ((maxRep*0.6 + avgRep*0.4) - S.rep)*0.35 + S.houses.length*0.1);
  R.rep = S.rep;

  S.houses.forEach(h=>{
    const st = STORIES[h.id]; if(!st || !h.story || h.story.beat>=st.beats.length) return;
    const need = STORY_REP[h.story.beat]||0, gap = storyGap(h);
    if(S.week - Math.max(h.since||1, h.story.wk||0) >= gap && h.rep>=need){ const b = h.story.beat; EVQ.push(()=> h.story.beat!==b ? null : houseStoryEvent(h, b)); }
  });
  seedBonds(); driftBonds();
  sleepInWeek(R);
  goddessAfter(R);
  lingerWeek(R);
  queueEncounters();
  // auto-renew (setting, on by default): a lady who'll certainly sign again does so at her going rate, bonus paid if Sam can afford it;
  // anyone unsure, or a bonus he can't cover, still gets the renewal event
  renew.forEach(w=>{ const a = SET.autoRenew !== false ? autoRenew(w) : null; if(a) R.lines.push(a); else EVQ.push(()=>evRenew(w)); });
  if(Math.random()<0.6){ const ev = pickRandomEvent(); if(ev) EVQ.push(ev); }
  if(S.flags.poachCD>0) S.flags.poachCD--;

  if(debtWeek()%BAL.debt.every===0){
    const nd = nextDue();
    if(nd.amount>0){
      if(S.gold >= nd.amount){
        S.gold -= nd.amount; S.debt.remaining -= nd.amount; S.debt.carry = 0;
        log(`📜 Paid ${fmt(nd.amount)} to the Vane Credit House. Remaining: ${fmt(S.debt.remaining)}.`);
      } else {
        S.debt.strikes++; const pen = Math.round(nd.amount*BAL.debt.penalty);
        S.debt.carry = Math.min(S.debt.remaining + pen, nd.amount + pen); S.debt.remaining += pen;
        log(`❌ Missed a debt payment! Strike ${S.debt.strikes}/${BAL.debt.strikes}. A ${fmt(pen)} penalty was added.`);
        EVQ.push(evStrike);
      }
    }
  }
  // samTrain fx (traits/uniques, data/traits/base.json): ladies who work near Sam drill him a little every week (e.g. Adelheid: Strength)
  S.workers.filter(w=>w.job!=='guild' && nearSam(w)).forEach(w=>fxList(w).forEach(f=>{ if(f.samTrain) Object.entries(f.samTrain).forEach(([k,n])=>{ if(SAM_STATS.includes(k)) samStat(k, n); }); }));
  const netXp = R.income - R.wages - R.upkeep - (R.cuts||0);
  if(netXp > 0) samGainXP(Math.min(30, Math.round(netXp/60)));
  S.week++; S.ap = apMax(); samEnergyAdd(samRecover(BAL.samHome.weekly) * samBonus('rest','strength') + (samUpFx('weekly')||0) + (hasPast('gym')?20:0));
  S.samWeek = {security:0, books:false, income:0, acts:[], focus:null, focusEff:0};
  refreshCandidates();
  townEventWeek(R);   // random.js: a town event starts or ends
  isoldeWeek(R);      // isolde.js: her next beat, a visit, the Thorn's overflow
  guildNewWeek();   // guild.js: a fresh board
  checkUnlocks(false, R.lines);
  S.lastReport = R;
  addLog(`Week ${R.week}: income ${fmt(R.income)}, wages ${fmt(R.wages)}, upkeep ${fmt(R.upkeep)}${R.cuts?`, cuts ${fmt(R.cuts)}`:''}${R.recharge?`, recharging ${fmt(R.recharge)}`:''}${R.tutor?`, tutors ${fmt(R.tutor)}`:''}.`);
  save(); render();
  if(typeof cloudAutoSave === 'function') cloudAutoSave();
  showReport(R, true);
}
