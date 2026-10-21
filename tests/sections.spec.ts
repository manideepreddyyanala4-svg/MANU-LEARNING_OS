import {test,expect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {readFileSync,mkdirSync,existsSync} from 'node:fs';

const email=process.env.MANU_TEST_EMAIL,password=process.env.MANU_TEST_PASSWORD;
test.skip(!email||!password||process.env.MANU_SECTIONS_READY!=='1','Requires owner credentials and applied migration 008.');
const env={...process.env,...Object.fromEntries((existsSync('.env.local')?readFileSync('.env.local','utf8'):'').split(/\r?\n/).filter(x=>x.includes('=')&&!x.startsWith('#')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).replace(/^['"]|['"]$/g,'')]}))};

test('sections organize topics without changing documents',async({page})=>{
 test.setTimeout(180000);
 const client=createClient(env.NEXT_PUBLIC_SUPABASE_URL!,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
 const {data:auth,error:authError}=await client.auth.signInWithPassword({email:email!,password:password!});if(authError)throw authError;
 const suffix=Date.now(),title=`Hierarchy audit ${suffix}`;
 const {data:subject,error:subjectError}=await client.from('subjects').insert({user_id:auth.user.id,title,slug:`hierarchy-audit-${suffix}`,order_index:999}).select().single();if(subjectError)throw subjectError;
 try{
  const sectionNames=['Noise','Filtering','Edge Detection'];
  const sectionRows=[];
  for(const [i,name] of sectionNames.entries()){const {data,error}=await client.from('learning_sections').insert({user_id:auth.user.id,subject_id:subject.id,title:name,order_index:i}).select().single();if(error)throw error;sectionRows.push(data)}
  const fixture=[['What is Noise?',0],['Gaussian Noise',0],['Salt & Pepper Noise',0],['Mean Filter',1],['Gaussian Filter',1],['Median Filter',1],['Bilateral Filter',1],['Sobel',2],['Scharr',2],['Laplacian',2],['Canny',2]] as const;
  const topicRows=[];
  for(const [i,[name,sectionIndex]] of fixture.entries()){const {data,error}=await client.from('topics').insert({user_id:auth.user.id,subject_id:subject.id,section_id:sectionRows[sectionIndex].id,title:name,slug:`lesson-${i}-${suffix}`,order_index:i}).select().single();if(error)throw error;topicRows.push(data)}
  const gaussian=topicRows[1];
  const content=[{type:'heading',props:{level:2},content:'What it looks like'},{type:'paragraph',content:'A pixel example with visible grain.'},{type:'heading',props:{level:3},content:'Pixel example'}];
  const {error:documentError}=await client.from('topic_documents').insert({user_id:auth.user.id,topic_id:gaussian.id,content_json:content,plain_text:'What it looks like A pixel example with visible grain. Pixel example',version:1});if(documentError)throw documentError;
  await page.goto('/login');await page.getByPlaceholder('Email address').fill(email!);await page.getByPlaceholder('Password').fill(password!);await page.getByRole('button',{name:'Continue'}).click();await expect(page).toHaveURL('/');
  await page.goto(`/learning/${subject.slug}/${gaussian.slug}`);
  await expect(page.getByRole('navigation',{name:'Breadcrumb'})).toContainText('Noise');
  await expect(page.getByRole('navigation',{name:'Subject navigation'}).getByRole('link',{name:/Gaussian Noise/})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Current topic headings'}).getByText('What it looks like')).toBeVisible();
  await page.getByRole('button',{name:'Collapse Noise'}).click();await expect(page.getByRole('link',{name:/Gaussian Noise/})).toBeHidden();
  await page.getByRole('button',{name:'Expand Noise'}).click();await expect(page.getByRole('link',{name:/Gaussian Noise/})).toBeVisible();
  mkdirSync('/tmp/manu-hierarchy',{recursive:true});
  for(const [label,width,height] of [['desktop',1440,900],['small-desktop',1024,768],['tablet',768,1024],['mobile',390,844]] as const){await page.setViewportSize({width,height});if(width<1024)await page.getByRole('button',{name:'Open learning navigation'}).click();await page.screenshot({path:`/tmp/manu-hierarchy/${label}.png`,fullPage:true});if(width<1024)await page.getByRole('banner').getByRole('button',{name:'Close learning navigation'}).click()}
  await page.goto(`/learning/${subject.slug}/${topicRows[2].slug}`);await page.getByRole('link',{name:'Next lesson →'}).click();await expect(page.getByRole('heading',{name:'Mean Filter'})).toBeVisible();
  await page.setViewportSize({width:1440,height:900});await page.goto(`/learning/${subject.slug}`);
  await expect(page.getByRole('heading',{name:'Filtering'})).toBeVisible();
  await page.getByRole('button',{name:'Actions for Filtering'}).click();await page.getByRole('button',{name:'Move up'}).click();
  await expect.poll(async()=>page.locator('.learning-section-heading h2').allTextContents()).toEqual(['Filtering','Noise','Edge Detection']);
  await page.reload();await expect.poll(async()=>page.locator('.learning-section-heading h2').allTextContents()).toEqual(['Filtering','Noise','Edge Detection']);
  await page.getByRole('button',{name:'Actions for Gaussian Noise'}).click();await page.getByRole('combobox',{name:'Move Gaussian Noise to section'}).selectOption(sectionRows[1].id);
  await expect(page.locator(`#section-${sectionRows[1].id}`).getByRole('link',{name:/Gaussian Noise/})).toBeVisible({timeout:15000});
  await page.reload();await expect(page.locator(`#section-${sectionRows[1].id}`).getByRole('link',{name:/Gaussian Noise/})).toBeVisible();
  const {data:afterMove,error:moveError}=await client.from('topic_documents').select('content_json').eq('topic_id',gaussian.id).single();if(moveError)throw moveError;expect(afterMove.content_json).toEqual(content);
  await page.getByRole('button',{name:'Actions for Filtering'}).click();page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Delete',exact:true}).click();
  await page.reload();await expect(page.getByRole('heading',{name:'Other topics'})).toBeVisible();await expect(page.getByRole('link',{name:/Gaussian Noise/}).last()).toBeVisible();
  const {data:afterDelete,error:deleteError}=await client.from('topics').select('section_id').eq('id',gaussian.id).single();if(deleteError)throw deleteError;expect(afterDelete.section_id).toBeNull();
  const {data:documentAfter,error:documentAfterError}=await client.from('topic_documents').select('content_json').eq('topic_id',gaussian.id).single();if(documentAfterError)throw documentAfterError;expect(documentAfter.content_json).toEqual(content);
 }finally{const {error}=await client.from('subjects').delete().eq('id',subject.id);if(error)throw error}
});
