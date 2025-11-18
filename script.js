 // Utility: Extract default branch name from GitHub repo API
        async function getDefaultBranch(repoUrl) {
            const match = repoUrl.match(/^https:\/\/github\.com\/([\w-]+)\/([\w.-]+)$/);
            if (!match) return null;
            const api = `https://api.github.com/repos/${match[1]}/${match[2]}`;
            try {
                const res = await fetch(api); const data = await res.json();
                return data.default_branch || 'master';
            } catch (e) { return 'master'; }
        }

        // --- Repo ZIP Logic ---
        async function generateZip() {
            const link = document.getElementById('repoLink').value.trim();
            const resultDiv = document.getElementById('zipResult');
            resultDiv.innerHTML = '';
            if (!link || !/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/.test(link)) {
                resultDiv.innerHTML = '<div class="error">❌ Please enter a valid GitHub repository link.</div>';
                return;
            }
            resultDiv.innerHTML = '⏳ Generating ZIP link <span class="loader small"></span>';
            const branch = await getDefaultBranch(link);
            const zipLink = `${link}/archive/refs/heads/${branch}.zip`;
            const caption = `
                <div class="caption card">
                    <div class="caption-left">
                        <div class="file-ico">📂</div>
                    </div>
                    <div class="caption-right">
                        <div class="caption-title">GitHub Repository ZIP File</div>
                        <a href="${zipLink}" id="realZip" class="github-link" target="_blank" rel="noopener">Download ZIP 📥</a>
                        <div class="meta">Branch: <u>${branch}</u> • Developer: <a href="https://github.com/MutyalaHarshith" target="_blank" rel="noopener">Mutyala Harshith</a></div>
                    </div>
                </div>
            `;
            setTimeout(() => { resultDiv.innerHTML = caption; }, 250);
        }
        function copyZip() {
            const link = document.getElementById('repoLink').value.trim();
            if (!link || !/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/.test(link)) {
                alert("Please enter a valid GitHub repo link first.");
                return;
            }
            getDefaultBranch(link).then(branch => {
                const zip = `${link}/archive/refs/heads/${branch}.zip`;
                navigator.clipboard.writeText(zip).then(() => {
                    // subtle toast instead of alert when available
                    showToast('ZIP link copied to clipboard!');
                }).catch(()=>{ alert('Unable to copy to clipboard.'); });
            });
        }

        // --- Profile Viewer Logic ---
        function fetchProfile() {
            const username = document.getElementById('githubUser').value.trim();
            const resultDiv = document.getElementById('profileResult');
            document.getElementById('repoList').innerHTML = '';
            resultDiv.innerHTML = '';
            if (!username) {
                resultDiv.innerHTML = '<div class="error">❌ Please provide a GitHub username.</div>';
                return;
            }
            resultDiv.innerHTML = '🔎 Loading profile <span class="loader small"></span>';
            fetch(`https://api.github.com/users/${username}`)
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'Not Found') {
                        resultDiv.innerHTML = `<div class="error">❌ GitHub user <b>${username}</b> not found.</div>`;
                        return;
                    }
                    const {
                        name = 'N/A', login = 'N/A', id = 'N/A', node_id = 'N/A',
                        avatar_url = '', html_url = '', repos_url = '', followers_url = '', following_url = '',
                        gists_url = '', blog = '', location = 'N/A', email = 'N/A',
                        hireable = 'N/A', bio = 'No bio provided.', twitter_username = 'N/A',
                        company = 'N/A', followers = 0, following = 0,
                        public_repos = 0, public_gists = 0, created_at = 'N/A', updated_at = 'N/A'
                    } = data;
                    resultDiv.innerHTML = `
                        <div class="card profile-card">
                            <img src="${avatar_url}" alt="Avatar" class="profile-pic">
                            <div class="profile-field"><b>Name:</b> ${name}</div>
                            <div class="profile-field"><b>Username:</b> ${login}</div><br>
                            <div class="profile-field"><b>ID:</b> ${id}</div><br>
                            <div class="profile-field"><b>Node ID:</b> ${node_id}</div><br>
                            <div class="profile-field"><b>Location:</b> ${location}</div><br><br>
                            <div class="profile-field"><b>Company:</b> ${company}</div><br>
                            <div class="profile-field"><b>Blog:</b> <a href="${blog||'#'}" target="_blank" rel="noopener">${blog||'N/A'}</a></div><br>
                            <div class="profile-field"><b>Email:</b> ${email}</div><br>
                            <div class="profile-field"><b>Hireable:</b> ${hireable}</div><br>
                            <div class="profile-field"><b>Twitter:</b> ${twitter_username||'N/A'}</div><br>
                            <div class="stats">
                                <div class="stat-box">
                                    <div class="stat-number">${public_repos}</div>
                                    <div class="stat-label">Repos</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-number">${followers}</div>
                                    <div class="stat-label">Followers</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-number">${following}</div>
                                    <div class="stat-label">Following</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-number">${public_gists}</div>
                                    <div class="stat-label">Gists</div>
                                </div>
                            </div>
                            <div class="profile-field bio">${bio}</div><br>
                            <div class="profile-field"><b>Created:</b> ${(new Date(created_at)).toLocaleString()}</div><br>
                            <div class="profile-field"><b>Updated:</b> ${(new Date(updated_at)).toLocaleString()}</div><br><br><br>
                            <div class="api-links">
                                <a href="${html_url}" target="_blank" rel="noopener" class="github-link">GitHub Profile</a><br>
                                <a href="${repos_url}" target="_blank" rel="noopener" class="github-link">Repos API</a><br>
                                <a href="${followers_url}" target="_blank" rel="noopener" class="github-link">Followers</a><br>
                                <a href="${gists_url}" target="_blank" rel="noopener" class="github-link">Gists</a>
                            </div>
                        </div>
                    `;
                }).catch(() => {
                    resultDiv.innerHTML = '<div class="error">⚠ Failed to fetch GitHub profile. Try again later.</div>';
                });
        }

        // --- Additional Feature: Show User's Recent Public Repos ---
        function fetchRepos() {
            const username = document.getElementById('githubUser').value.trim();
            const repoDiv = document.getElementById('repoList');
            repoDiv.innerHTML = '';
            if (!username) {
                repoDiv.innerHTML = '<div class="error">❌ Provide a username to see their repositories.</div>';
                return;
            }
            repoDiv.innerHTML = '📦 Fetching repositories <span class="loader small"></span>';
            fetch(`https://api.github.com/users/${username}/repos?per_page=5&sort=updated`)
                .then(res => res.json())
                .then(list => {
                    if (!Array.isArray(list) || list.length === 0 || list.message === 'Not Found') {
                        repoDiv.innerHTML = '<div class="error">No public repositories found.</div>';
                        return;
                    }
                    let html = `<div class="card"><b>Recent Repositories</b><ul class="repo-list">`;
                    for (const repo of list) {
                        html += `<li class="repo-item">
                            <a href="${repo.html_url}" target="_blank" rel="noopener" class="github-link">${repo.name}</a>
                            <div class="repo-desc">${repo.description || 'No description'}</div>
                            <small>⭐ ${repo.stargazers_count} | Forks: ${repo.forks_count} | Updated: ${(new Date(repo.updated_at)).toLocaleDateString()}</small>
                        </li>`;
                    }
                    html += `</ul></div>`;
                    repoDiv.innerHTML = html;
                }).catch(() => {
                    repoDiv.innerHTML = '<div class="error">⚠ Repos could not be loaded.</div>';
                });
        }

        // small toast helper
        function showToast(msg) {
            let t = document.createElement('div');
            t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
            requestAnimationFrame(()=> t.classList.add('visible'));
            setTimeout(()=>{ t.classList.remove('visible'); setTimeout(()=>t.remove(),300); }, 2500);
        }