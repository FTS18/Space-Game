'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../components/layout/Footer';

// Define structures
interface AppAsset {
  name: string;
  downloadUrl: string;
  size: string;
}

interface AppDetails {
  id: string;
  name: string;
  repo: string;
  category: 'games' | 'utilities' | 'development' | 'productivity';
  description: string;
  longDescription: string;
  platforms: ('windows' | 'macos' | 'linux' | 'android')[];
  stars: number;
  imageUrl: string;
  isFeatured?: boolean;
  version?: string;
  releaseDate?: string;
  releaseNotes?: string;
  assets?: AppAsset[];
}

interface DownloadState {
  id: string;
  name: string;
  progress: number; // 0 to 100
  speed: string; // e.g. "45.2 MB/s"
  downloaded: string; // e.g. "12 MB"
  total: string; // e.g. "85 MB"
  completed: boolean;
  fileUrl?: string;
}

// Curated list of popular open source apps
const curatedApps: AppDetails[] = [
  {
    id: 'godot',
    name: 'Godot Engine',
    repo: 'godotengine/godot',
    category: 'development',
    description: 'A multi-platform 2D and 3D game engine that lets you create games from scratch.',
    longDescription: 'Godot provides a huge set of common tools, so you can just focus on making your game without reinventing the wheel. It is completely free and open-source under the very permissive MIT license. No strings attached, no royalties, nothing.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 64200,
    imageUrl: '/assets/images/backgrounds/24.png',
    isFeatured: true,
    version: 'v4.2.1-stable',
    releaseDate: '2024-01-20',
    releaseNotes: 'Features C# support, major rendering upgrades, and physics enhancements.'
  },
  {
    id: 'obs',
    name: 'OBS Studio',
    repo: 'obsproject/obs-studio',
    category: 'utilities',
    description: 'Free and open source software for video recording and live streaming.',
    longDescription: 'OBS Studio is a powerful utility for capture, mixing, and broadcasting. It is utilized globally by content creators, game streamers, and developers. Build custom scenes, mix multi-source audio, and stream directly to twitch, youtube, and more.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 56800,
    imageUrl: '/assets/images/backgrounds/14.jpg',
    isFeatured: true,
    version: 'v30.1.2',
    releaseDate: '2024-04-12',
    releaseNotes: 'Fixed several hardware acceleration bugs and added a new virtual camera setup.'
  },
  {
    id: 'mindustry',
    name: 'Mindustry',
    repo: 'Anuken/Mindustry',
    category: 'games',
    description: 'A hybrid tower-defense sandbox factory game. Build factory belts and defend.',
    longDescription: 'Mindustry is a tower-defense sandbox factory game. Create elaborate supply chains of conveyor belts to feed ammo into your turrets, produce materials for construction, and defend your structures from waves of enemies. Supports multiplayer and custom maps.',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stars: 21500,
    imageUrl: '/assets/images/backgrounds/24.png',
    version: 'v146',
    releaseDate: '2023-12-05',
    releaseNotes: 'Features new units, improved fluid dynamics, and server UI upgrades.'
  },
  {
    id: 'shatteredpd',
    name: 'Shattered Pixel Dungeon',
    repo: '00-Evan/shattered-pixel-dungeon',
    category: 'games',
    description: 'A traditional roguelike dungeon crawler game with randomized levels and pixel art.',
    longDescription: 'Shattered Pixel Dungeon is a traditional roguelike dungeon crawler game that is simple to get into but hard to master! Every game is a unique challenge, with four playable heroes, randomized levels and enemies, and hundreds of items to collect and use.',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stars: 6200,
    imageUrl: '/assets/images/backgrounds/09.jpg',
    version: 'v2.4.2',
    releaseDate: '2024-05-18',
    releaseNotes: 'Adds the new Duelist class upgrades, balancing, and graphic touch-ups.'
  },
  {
    id: 'supertuxkart',
    name: 'SuperTuxKart',
    repo: 'supertuxkart/stk-code',
    category: 'games',
    description: 'A 3D open-source arcade kart racer featuring a variety of characters, tracks, and modes.',
    longDescription: 'Play with mascot characters from open-source projects (like Tux, Beastie, and Wilber) on gorgeous maps. Enjoy local multiplayer splitscreen, online multiplayer matchups, and a massive story mode campaign.',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stars: 5100,
    imageUrl: '/assets/images/backgrounds/01.jpg',
    version: 'v1.4.0',
    releaseDate: '2023-11-01',
    releaseNotes: 'Features graphics rendering updates and network performance improvements.'
  },
  {
    id: 'supertux',
    name: 'SuperTux',
    repo: 'SuperTux/supertux',
    category: 'games',
    description: 'A classic 2D jump-and-run sidescroller platformer game inspired by Super Mario.',
    longDescription: 'SuperTux is a classic 2D jump-and-run sidescroller platformer game in a style similar to the original Super Mario games. Run and jump through multiple worlds, fighting off enemies with powerups, and save Penny!',
    platforms: ['windows', 'macos', 'linux'],
    stars: 2500,
    imageUrl: '/assets/images/backgrounds/01.jpg',
    version: 'v0.6.3',
    releaseDate: '2022-12-24',
    releaseNotes: 'Features new rendering backend, updated editor, and new levels.'
  },
  {
    id: 'blender',
    name: 'Blender 3D',
    repo: 'blender/blender',
    category: 'productivity',
    description: 'The free and open source 3D creation suite. It supports the entirety of the 3D pipeline.',
    longDescription: 'Blender is a fully-featured suite containing modeling, rigging, animation, simulation, rendering, compositing and motion tracking, video editing and 2D animation pipeline tools. Ideal for artists and programmers alike.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 12000,
    imageUrl: '/assets/images/backgrounds/22.webp',
    version: 'v4.1.0',
    releaseDate: '2024-03-26',
    releaseNotes: 'Major cycles renderer speed improvements, new sculpting tools, and UI updates.'
  },
  {
    id: 'unciv',
    name: 'Unciv',
    repo: 'yairm210/Unciv',
    category: 'games',
    description: 'An open-source, highly playable Android & Desktop recreation of Civilization V.',
    longDescription: 'Build your civilization, research tech, expand your empire, and conquer opponents in this lightweight, beautifully crafted turn-based retro strategy recreation. Supports multiplayer games and custom modpacks.',
    platforms: ['windows', 'linux', 'android'],
    stars: 18400,
    imageUrl: '/assets/images/backgrounds/09.jpg',
    version: 'v4.10.15',
    releaseDate: '2024-06-30',
    releaseNotes: 'Added new localized language options, AI optimization, and minor bug fixes.'
  },
  {
    id: 'localsend',
    name: 'LocalSend',
    repo: 'localsend/localsend',
    category: 'utilities',
    description: 'An open-source cross-platform alternative to AirDrop. Share files on local networks.',
    longDescription: 'LocalSend is an open-source cross-platform application that allows you to securely share files and messages with nearby devices over a local network. No internet connection or third-party servers required.',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stars: 37500,
    imageUrl: '/assets/images/backgrounds/14.jpg',
    isFeatured: true,
    version: 'v1.14.0',
    releaseDate: '2024-06-15',
    releaseNotes: 'Optimized scan speed, added advanced settings, and translated into new languages.'
  },
  {
    id: 'sharex',
    name: 'ShareX',
    repo: 'ShareX/ShareX',
    category: 'utilities',
    description: 'Free and open source screen capture, file sharing, and productivity tool for Windows.',
    longDescription: 'ShareX is a free and open-source program that lets you capture or record any area of your screen and share it with a single press of a key. It also allows uploading images, text or other files to many supported destinations.',
    platforms: ['windows'],
    stars: 46800,
    imageUrl: '/assets/images/backgrounds/05.jpg',
    version: 'v16.1.0',
    releaseDate: '2024-05-10',
    releaseNotes: 'Adds dark mode support for tools, improves screen recorder options, and minor fixes.'
  },
  {
    id: 'audacity',
    name: 'Audacity',
    repo: 'audacity/audacity',
    category: 'utilities',
    description: 'Audacity is an easy-to-use, multi-track audio editor and recorder.',
    longDescription: 'Audacity is an open-source digital audio editor. Record live audio, convert tapes into digital tracks, edit multi-channel formats, and apply audio effects such as normalization, fade in/out, and compression.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 15300,
    imageUrl: '/assets/images/backgrounds/05.jpg',
    version: 'v3.5.1',
    releaseDate: '2024-05-02',
    releaseNotes: 'Includes cloud saving integration, pitch shifting upgrades, and export speed enhancements.'
  },
  {
    id: 'kodi',
    name: 'Kodi Media Center',
    repo: 'xbmc/xbmc',
    category: 'utilities',
    description: 'A free and open-source media player software application and digital entertainment hub.',
    longDescription: 'Kodi is a free and open-source media player software application developed by the XBMC Foundation. It allows users to play and view most videos, music, podcasts, and other digital media files from local and network storage media.',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stars: 17800,
    imageUrl: '/assets/images/backgrounds/22.webp',
    version: 'v21.0-Omega',
    releaseDate: '2024-04-06',
    releaseNotes: 'Features major stability improvements, new web server setups, and FFmpeg updates.'
  },
  {
    id: 'vscodium',
    name: 'VSCodium',
    repo: 'VSCodium/vscodium',
    category: 'development',
    description: 'Community-led, telemetry-free binaries of Microsofts VS Code.',
    longDescription: 'VSCodium is a community-led, freely licensed binary distribution of Microsoft’s editor VS Code. It provides the exact same visual editing experience, extension marketplace access, and developer tools without telemetry, tracking, or branding hooks.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 25200,
    imageUrl: '/assets/images/backgrounds/14.jpg',
    version: 'v1.90.2',
    releaseDate: '2024-06-25',
    releaseNotes: 'Updates editor dependencies to match the latest open source VS Code releases.'
  },
  {
    id: 'neovim',
    name: 'Neovim',
    repo: 'neovim/neovim',
    category: 'development',
    description: 'Vim-fork focused on extensibility and usability with Lua scripting integration.',
    longDescription: 'Neovim is a heavily refactored fork of Vim that focuses on extensibility, usability, and asynchronous performance. Features built-in LSP support, tree-sitter syntax engine, and full Lua plugin compatibility.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 78500,
    imageUrl: '/assets/images/backgrounds/24.png',
    version: 'v0.10.0',
    releaseDate: '2024-05-16',
    releaseNotes: 'Features massive default mapping updates, terminal fixes, and stable Lua APIs.'
  },
  {
    id: 'logseq',
    name: 'Logseq',
    repo: 'logseq/logseq',
    category: 'productivity',
    description: 'A privacy-first, open-source knowledge manager and outliner note-taking tool.',
    longDescription: 'Logseq is a privacy-first, open-source platform for knowledge sharing and management. It focuses on privacy, longevity, and user control. It works directly on local Markdown and Org-mode text files to map your ideas.',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stars: 31200,
    imageUrl: '/assets/images/backgrounds/09.jpg',
    version: 'v0.10.9',
    releaseDate: '2024-06-08',
    releaseNotes: 'Features performance updates, file synchronization fixes, and PDF annotation support.'
  },
  {
    id: 'krita',
    name: 'Krita',
    repo: 'KDE/krita',
    category: 'productivity',
    description: 'A professional open-source painting program for sketching, concept art, and illustrations.',
    longDescription: 'Krita is a professional free and open-source painting program. It is made by artists that want to see affordable art tools for everyone. Ideal for concept art, texture and matte painters, illustrations, and comics.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 7600,
    imageUrl: '/assets/images/backgrounds/05.jpg',
    version: 'v5.2.2',
    releaseDate: '2023-12-07',
    releaseNotes: 'Major improvements in animation pipelines, text tool updates, and brush speedups.'
  },
  {
    id: 'drawio',
    name: 'Draw.io Desktop',
    repo: 'jgraph/drawio-desktop',
    category: 'productivity',
    description: 'Completely offline desktop diagramming and vector graphics creator application.',
    longDescription: 'Draw.io desktop is a completely offline diagramming application that runs on Windows, macOS, and Linux. Perfect for creating flowcharts, UML diagrams, network layouts, and mockups without sending data online.',
    platforms: ['windows', 'macos', 'linux'],
    stars: 6600,
    imageUrl: '/assets/images/backgrounds/22.webp',
    version: 'v24.4.3',
    releaseDate: '2024-05-24',
    releaseNotes: 'Features updated UI layouts, SVG export optimizations, and shape library additions.'
  }
];

export default function AppStore(): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appsList, setAppsList] = useState<AppDetails[]>(curatedApps);
  const [selectedApp, setSelectedApp] = useState<AppDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [isSearchingGithub, setIsSearchingGithub] = useState<boolean>(false);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [activeDownloads, setActiveDownloads] = useState<DownloadState[]>([]);

  const featuredApps = appsList.filter((app) => app.isFeatured);

  // Cycle featured apps every 6 seconds
  useEffect(() => {
    if (featuredApps.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredApps.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredApps.length]);

  // Handle local searching/filtering
  useEffect(() => {
    let filtered = curatedApps;

    if (activeFilter !== 'all') {
      filtered = filtered.filter((app) => app.category === activeFilter);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.repo.toLowerCase().includes(query)
      );
    }

    setAppsList(filtered);
  }, [activeFilter, searchQuery]);

  // Query GitHub search API for external apps
  const handleGithubSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingGithub(true);

    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}+topic:desktop-app+topic:game+is:public&sort=stars&order=desc`
      );
      if (!response.ok) throw new Error('API Rate Limited or Offline');
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const parsedApps: AppDetails[] = data.items.slice(0, 8).map((item: any) => ({
          id: String(item.id),
          name: item.name.replace(/[-_]/g, ' '),
          repo: item.full_name,
          category: item.topics?.includes('game') ? 'games' : 'utilities',
          description: item.description || 'No description provided.',
          longDescription: `${item.description || ''} This repository is open-source and hosted on GitHub. Under active development by ${item.owner.login}.`,
          platforms: ['windows', 'linux', 'macos'],
          stars: item.stargazers_count,
          imageUrl: '/assets/images/backgrounds/09.jpg',
          version: 'Latest Release',
          releaseNotes: `This app was dynamically scraped from GitHub. Star count: ${item.stargazers_count}. Fork count: ${item.forks_count}.`
        }));

        setAppsList((prev) => {
          // Merge local curated and search results, avoiding duplicates
          const uniqueCurated = prev.filter((app) => curatedApps.some((c) => c.id === app.id));
          const filteredNew = parsedApps.filter((app) => !uniqueCurated.some((c) => c.repo === app.repo));
          return [...uniqueCurated, ...filteredNew];
        });
      } else {
        alert('No repositories matching your query were found.');
      }
    } catch (err) {
      console.error('GitHub search failed, falling back to local list.', err);
      alert('GitHub API rate-limit reached. Displaying local matches only.');
    } finally {
      setIsSearchingGithub(false);
    }
  };

  // Fetch release details for selected app
  const openAppDetails = async (app: AppDetails) => {
    setSelectedApp(app);
    setIsLoadingDetails(true);

    try {
      const response = await fetch(`https://api.github.com/repos/${app.repo}/releases/latest`);
      if (!response.ok) throw new Error('Release not found or API rate limited');
      const release = await response.json();

      // Format assets list
      const assets: AppAsset[] = release.assets.map((asset: any) => ({
        name: asset.name,
        downloadUrl: asset.browser_download_url,
        size: asset.size ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown'
      }));

      setSelectedApp((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          version: release.tag_name,
          releaseDate: new Date(release.published_at).toLocaleDateString(),
          releaseNotes: release.body || prev.releaseNotes,
          assets: assets.length > 0 ? assets : undefined
        };
      });
    } catch (err) {
      console.warn('Failed to fetch live release details, displaying fallback data.', err);
      // Fallback: mock assets for the download
      const defaultAssets: AppAsset[] = [
        {
          name: `${app.name.toLowerCase().replace(/\s/g, '-')}-x64-setup.exe`,
          downloadUrl: `https://github.com/${app.repo}/archive/refs/heads/main.zip`,
          size: '42.5 MB'
        },
        {
          name: `${app.name.toLowerCase().replace(/\s/g, '-')}-macos.dmg`,
          downloadUrl: `https://github.com/${app.repo}/archive/refs/heads/main.zip`,
          size: '38.2 MB'
        },
        {
          name: `${app.name.toLowerCase().replace(/\s/g, '-')}-linux.tar.gz`,
          downloadUrl: `https://github.com/${app.repo}/archive/refs/heads/main.zip`,
          size: '45.1 MB'
        }
      ];
      setSelectedApp((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          assets: defaultAssets
        };
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Trigger app download with interactive progress bar simulation
  const startDownload = (app: AppDetails, specificAssetName?: string, specificAssetUrl?: string) => {
    const assetName = specificAssetName || `${app.name.toLowerCase().replace(/\s/g, '-')}-x64-setup.exe`;
    const downloadUrl = specificAssetUrl || `https://github.com/${app.repo}/archive/refs/heads/main.zip`;

    // Avoid duplicates
    if (activeDownloads.some((dl) => dl.name === assetName && !dl.completed)) {
      alert('This download is already in progress.');
      return;
    }

    const downloadId = Math.random().toString(36).substring(2, 9);
    const mockTotalSize = specificAssetName ? 100 : Math.floor(Math.random() * 80) + 30; // Random size in MB
    const totalString = specificAssetName ? '' : `${mockTotalSize} MB`;

    const newDownload: DownloadState = {
      id: downloadId,
      name: assetName,
      progress: 0,
      speed: 'Initializing...',
      downloaded: '0 MB',
      total: totalString,
      completed: false,
      fileUrl: downloadUrl
    };

    setActiveDownloads((prev) => [newDownload, ...prev]);

    // Simulate transfer chunks
    let currentPercent = 0;
    const interval = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 15) + 5;
      if (currentPercent >= 100) {
        currentPercent = 100;
        clearInterval(interval);

        setActiveDownloads((prev) =>
          prev.map((dl) =>
            dl.id === downloadId
              ? {
                  ...dl,
                  progress: 100,
                  speed: '0 KB/s',
                  downloaded: dl.total || 'Done',
                  completed: true
                }
              : dl
          )
        );

        // Perform actual download redirect at completion
        window.open(downloadUrl, '_blank');

        // Autoclose downloaded rows after 5 seconds to prevent list clutter
        setTimeout(() => {
          setActiveDownloads((prev) => prev.filter((dl) => dl.id !== downloadId));
        }, 5000);
      } else {
        const simulatedSpeed = (Math.random() * 30 + 15).toFixed(1); // 15 - 45 MB/s
        const totalMb = mockTotalSize;
        const downloadedMb = ((currentPercent / 100) * totalMb).toFixed(1);

        setActiveDownloads((prev) =>
          prev.map((dl) =>
            dl.id === downloadId
              ? {
                  ...dl,
                  progress: currentPercent,
                  speed: `${simulatedSpeed} MB/s`,
                  downloaded: `${downloadedMb} MB`,
                  total: `${totalMb} MB`
                }
              : dl
          )
        );
      }
    }, 400);
  };

  return (
    <>
      <div className="ripple"></div>

      <motion.main
        className="page store-container-adjust"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <div className="store-container">
          {/* Featured Carousel Header */}
          {featuredApps.length > 0 && (
            <div
              className="store-hero"
              style={{
                backgroundImage: `url(${featuredApps[featuredIndex]?.imageUrl})`
              }}
            >
              <div className="store-hero-overlay">
                <span className="store-hero-badge">FEATURED UTILITY</span>
                <h1>{featuredApps[featuredIndex]?.name}</h1>
                <p>{featuredApps[featuredIndex]?.description}</p>
                <div className="store-hero-meta">
                  <span>
                    <i className="fas fa-star" /> {featuredApps[featuredIndex]?.stars.toLocaleString()} Github Stars
                  </span>
                  <span>
                    <i className="fas fa-code-branch" /> Open Source
                  </span>
                </div>
                <button
                  className="store-hero-btn"
                  onClick={() => openAppDetails(featuredApps[featuredIndex])}
                >
                  View Details & Download
                </button>
              </div>
            </div>
          )}

          {/* Search bar & Controls */}
          <div className="store-controls">
            <div className="store-search-bar">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Search local catalog or type GitHub repo (e.g. obsproject/obs-studio)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGithubSearch();
                }}
              />
            </div>

            <div className="store-filters">
              <button
                className={`store-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`store-filter-btn ${activeFilter === 'games' ? 'active' : ''}`}
                onClick={() => setActiveFilter('games')}
              >
                Games
              </button>
              <button
                className={`store-filter-btn ${activeFilter === 'utilities' ? 'active' : ''}`}
                onClick={() => setActiveFilter('utilities')}
              >
                Utilities
              </button>
              <button
                className={`store-filter-btn ${activeFilter === 'development' ? 'active' : ''}`}
                onClick={() => setActiveFilter('development')}
              >
                Dev Tools
              </button>
              <button
                className={`store-filter-btn ${activeFilter === 'productivity' ? 'active' : ''}`}
                onClick={() => setActiveFilter('productivity')}
              >
                Productivity
              </button>
              {searchQuery && (
                <button
                  className="store-filter-btn"
                  style={{ background: '#dfc06f', color: '#0e0c15' }}
                  onClick={handleGithubSearch}
                  disabled={isSearchingGithub}
                >
                  {isSearchingGithub ? 'Scraping...' : 'Scrape GitHub'}
                </button>
              )}
            </div>
          </div>

          {/* App Listing Grid */}
          <div className="store-grid">
            {appsList.map((app) => (
              <div key={app.id} className="app-card">
                <div>
                  <div className="app-card-header">
                    <div className="app-card-platforms">
                      <i className={`fab fa-windows ${app.platforms.includes('windows') ? 'active' : ''}`} />
                      <i className={`fab fa-apple ${app.platforms.includes('macos') ? 'active' : ''}`} />
                      <i className={`fab fa-linux ${app.platforms.includes('linux') ? 'active' : ''}`} />
                      <i className={`fab fa-android ${app.platforms.includes('android') ? 'active' : ''}`} />
                    </div>
                    {app.version && <span className="app-card-version">{app.version}</span>}
                  </div>
                  <h3 className="app-card-title">{app.name}</h3>
                  <p className="app-card-desc">{app.description}</p>
                </div>

                <div>
                  <div className="app-card-stats">
                    <span>
                      <i className="fas fa-star" /> {app.stars.toLocaleString()}
                    </span>
                    <span>
                      <i className="fas fa-code" /> {app.repo.split('/')[0]}
                    </span>
                  </div>

                  <div className="app-card-actions">
                    <button className="app-btn-details" onClick={() => openAppDetails(app)}>
                      Details
                    </button>
                    <button className="app-btn-download" onClick={() => startDownload(app)}>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Footer />
        </div>
      </motion.main>

      {/* App Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-header">
                <h2>{selectedApp.name}</h2>
                <button className="modal-close" onClick={() => setSelectedApp(null)}>
                  <i className="fas fa-times" />
                </button>
              </div>

              <div className="modal-body">
                <h3>About</h3>
                <p>{selectedApp.longDescription}</p>

                <div style={{ display: 'flex', gap: '30px', margin: '20px 0', color: '#dfc06f' }}>
                  {selectedApp.version && (
                    <div>
                      <strong>Version:</strong> {selectedApp.version}
                    </div>
                  )}
                  {selectedApp.releaseDate && (
                    <div>
                      <strong>Released:</strong> {selectedApp.releaseDate}
                    </div>
                  )}
                </div>

                {isLoadingDetails ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#dfc06f' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }} />
                    Scraping release notes and files from GitHub...
                  </div>
                ) : (
                  <>
                    {selectedApp.releaseNotes && (
                      <>
                        <h3>Release Notes</h3>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedApp.releaseNotes}</pre>
                      </>
                    )}

                    <h3>Files Available to Download</h3>
                    <div className="modal-assets-list">
                      {selectedApp.assets ? (
                        selectedApp.assets.map((asset, idx) => (
                          <div key={idx} className="modal-asset-item">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                startDownload(selectedApp, asset.name, asset.downloadUrl);
                              }}
                            >
                              <i className="fas fa-file-download" style={{ marginRight: '8px' }} />
                              {asset.name}
                            </a>
                            <span className="modal-asset-meta">Size: {asset.size}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '15px', color: '#55506a' }}>
                          No files found. Standard zip archive will be fetched on click.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button className="app-btn-details" onClick={() => setSelectedApp(null)}>
                  Close
                </button>
                <button className="app-btn-download" onClick={() => startDownload(selectedApp)}>
                  Download Default Binaries
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Download Manager HUD */}
      <AnimatePresence>
        {activeDownloads.length > 0 && (
          <motion.div
            className="download-manager-hud"
            initial={{ translateY: 100, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: 100, opacity: 0 }}
          >
            <div className="download-hud-header">
              <h4>
                <i className="fas fa-cloud-download-alt" />
                Active Downloads
              </h4>
              <span style={{ fontSize: '12px', color: '#dfc06f', fontWeight: 'bold' }}>
                {activeDownloads.filter((d) => !d.completed).length} running
              </span>
            </div>
            <div className="download-hud-body">
              {activeDownloads.map((dl) => (
                <div key={dl.id} className="download-item-row">
                  <div className="download-item-info">
                    <span className="download-item-name" title={dl.name}>
                      {dl.name}
                    </span>
                    <span>{dl.progress}%</span>
                  </div>

                  <div className="download-progress-bar-container">
                    <div className="download-progress-fill" style={{ width: `${dl.progress}%` }} />
                  </div>

                  <div className="download-item-meta">
                    {dl.completed ? (
                      <span style={{ color: '#50c878', fontWeight: 'bold' }}>
                        <i className="fas fa-check-circle" style={{ marginRight: '5px' }} />
                        Download Complete
                      </span>
                    ) : (
                      <>
                        <span>{dl.speed}</span>
                        <span>
                          {dl.downloaded} / {dl.total || 'Calculating...'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
