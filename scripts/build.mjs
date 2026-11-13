import fs from 'node:fs';
import path from 'node:path';
import { icons } from './icons.mjs';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'O';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderInitialsAvatar(name, role) {
  const initials = escapeHtml(getInitials(name));
  return `
    <div class="w-full h-full rounded-full bg-[#EBF7FF] border border-[#30AFFF]/30 flex items-center justify-center text-[#0B3C5D] font-bold select-none" aria-label="${escapeHtml(name)} avatar">
      <span>${initials}</span>
    </div>
  `.trim();
}

function renderMemberCard(member, isDeptRep = false) {
  const name = escapeHtml(member.name);
  const role = escapeHtml(member.role);
  const deptText = escapeHtml(member.deptText || member.department || 'Student Volunteer');
  const bio = member.bio ? escapeHtml(member.bio) : '';

  let photoHtml = '';
  if (member.photoConsent && member.photo) {
    const photoSrc = escapeHtml(member.photo);
    photoHtml = `<img src="${photoSrc}" alt="${name}, ${role}" class="w-full h-full object-cover transition-opacity duration-300" width="300" height="300" loading="lazy" data-member-name="${name}">`;
  } else {
    photoHtml = renderInitialsAvatar(member.name, member.role);
  }

  const bioHtml = bio
    ? `<p class="text-xs text-[#4B637A] leading-relaxed pt-3 border-t border-[#E5EBF0] mt-3 w-full">${bio}</p>`
    : '';

  const sizeClass = isDeptRep ? 'w-24 h-24 text-lg' : 'w-28 h-28 sm:w-32 sm:h-32 text-xl sm:text-2xl';

  return `
    <article class="oasis-card p-5 text-center flex flex-col items-center justify-between reveal">
      <div class="w-full flex flex-col items-center">
        <div class="member-photo-container ${sizeClass} mb-3.5">
          ${photoHtml}
        </div>
        <span class="px-2.5 py-0.5 rounded-full bg-[#EBF7FF] text-[#0B3C5D] text-xs font-bold border border-[#30AFFF]/30 mb-1.5">
          ${role}
        </span>
        <h4 class="text-base font-bold font-heading text-[#0B3C5D]">${name}</h4>
        <p class="text-xs text-[#4B637A] font-medium mt-0.5">${deptText}</p>
      </div>
      ${bioHtml}
    </article>
  `.trim();
}

function renderAdvisorCard(advisor) {
  const name = escapeHtml(advisor.name);
  const role = escapeHtml(advisor.role);
  const deptText = escapeHtml(advisor.deptText);
  const bio = escapeHtml(advisor.bio);
  const photo = escapeHtml(advisor.photo || advisor.photoFallback);

  return `
    <article class="oasis-card p-6 text-center flex flex-col items-center justify-between reveal">
      <div class="w-full flex flex-col items-center">
        <div class="member-photo-container w-36 h-36 sm:w-40 sm:h-40 mb-4 bg-[#FAF8F5]">
          <img src="${photo}" alt="${name}, ${role}" class="w-full h-full object-cover" width="600" height="600" loading="lazy" data-member-name="${name}">
        </div>
        <span class="px-3 py-0.5 rounded-full bg-[#EBF7FF] text-[#0B3C5D] text-xs font-bold border border-[#30AFFF]/30 mb-2">
          ${role}
        </span>
        <h4 class="text-lg font-bold font-heading text-[#0B3C5D]">${name}</h4>
        <p class="text-xs text-[#4B637A] font-medium mt-0.5">${deptText}</p>
      </div>
      <p class="text-xs text-[#4B637A] leading-relaxed pt-4 border-t border-[#E5EBF0] mt-4 w-full">
        ${bio}
      </p>
    </article>
  `.trim();
}

function renderInitiativeCard(item) {
  const id = escapeHtml(item.id);
  const badge = escapeHtml(item.badge);
  const title = escapeHtml(item.title);
  const image = escapeHtml(item.image);
  const alt = escapeHtml(item.alt);
  const description = escapeHtml(item.description);
  const dateHtml = item.date
    ? `<p class="initiative-date text-xs font-semibold text-[#4B637A] mb-2">${escapeHtml(item.date)}</p>`
    : '';

  return `
    <article class="oasis-card flex flex-col justify-between overflow-hidden reveal">
      <div>
        <div class="relative h-60 sm:h-72 overflow-hidden bg-[#FAF8F5]">
          <img src="${image}" alt="${alt}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" width="${item.imageWidth || 800}" height="${item.imageHeight || 600}" loading="lazy">
          <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[#0B3C5D] text-xs font-bold shadow-sm border border-[#E5EBF0]">
            ${badge}
          </span>
        </div>
        <div class="p-6">
          ${dateHtml}
          <h3 class="text-xl font-bold font-heading text-[#0B3C5D] mb-2">${title}</h3>
          <p class="text-sm text-[#4B637A] leading-relaxed">${description}</p>
        </div>
      </div>
      <div class="p-6 pt-0">
        <button type="button" data-initiative="${id}" class="open-initiative-modal btn-secondary w-full text-sm">
          <span>Learn More</span>
          ${icons['arrow-right']}
        </button>
      </div>
    </article>
  `.trim();
}

function renderGalleryCard(photo, index) {
  const thumb = escapeHtml(photo.thumb);
  const alt = escapeHtml(photo.alt);
  const category = escapeHtml(photo.category);
  const title = escapeHtml(photo.title);
  const caption = escapeHtml(photo.caption);

  return `
    <article class="gallery-card group reveal" data-gallery-index="${index}" tabindex="0" role="button" aria-label="View photo: ${title}">
      <div class="gallery-thumb-wrapper">
        <img src="${thumb}" alt="${alt}" width="800" height="533" loading="lazy" class="group-hover:scale-105 transition-transform duration-500">
        <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#0B3C5D] text-xs font-bold shadow-sm border border-[#E5EBF0]">
          ${category}
        </span>
        <div class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/95 text-[#0B3C5D] flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" aria-hidden="true">
          ${icons['maximize-2']}
        </div>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <h3 class="font-heading text-lg font-bold text-[#0B3C5D] leading-snug group-hover:text-[#0875B8] transition-colors">
          ${title}
        </h3>
        <p class="text-xs text-[#4B637A] mt-2 line-clamp-2 leading-relaxed">
          ${caption}
        </p>
      </div>
    </article>
  `.trim();
}

export function build() {
  console.log('Reading data files...');
  const site = JSON.parse(fs.readFileSync('data/site.json', 'utf8'));
  const committee = JSON.parse(fs.readFileSync('data/committee.json', 'utf8'));
  const initiatives = JSON.parse(fs.readFileSync('data/initiatives.json', 'utf8'));
  const gallery = JSON.parse(fs.readFileSync('data/gallery.json', 'utf8'));

  // Separate leads/executives and dept reps
  const advisors = committee.advisors || [];
  const leads = (committee.members || []).filter(m => m.isLead !== false && m.role !== 'Department Representative');
  const deptReps = (committee.members || []).filter(m => m.role === 'Department Representative');

  const advisorsHtml = advisors.map(renderAdvisorCard).join('\n');
  const leadsHtml = leads.map(m => renderMemberCard(m, false)).join('\n');
  const deptRepsHtml = deptReps.map(m => renderMemberCard(m, true)).join('\n');
  const initiativesHtml = initiatives.map(renderInitiativeCard).join('\n');
  const galleryHtml = gallery.map(renderGalleryCard).join('\n');

  // Generate robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${site.baseUrl.replace(/\/$/, '')}/sitemap.xml\n`;
  fs.writeFileSync('robots.txt', robotsTxt);
  console.log('Wrote robots.txt');

  // Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  fs.writeFileSync('sitemap.xml', sitemapXml);
  console.log('Wrote sitemap.xml');

  return {
    site,
    advisorsHtml,
    leadsHtml,
    deptRepsHtml,
    initiativesHtml,
    galleryHtml,
    leadsCount: leads.length,
    deptRepsCount: deptReps.length
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*[/\\]/, ''))) {
  build();
}
