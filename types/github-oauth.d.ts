/*
 * Copyright (C) 2025 Ty Busby
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface GitHubUserBase {
    login: string;
    id: number;
    user_view_type?: string;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    notification_email?: string | null;
    hireable: boolean | null;
    bio: string | null;
    twitter_username: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    plan?: {
        collaborators: number;
        name: string;
        space: number;
        private_repos: number;
    };
}

export interface GitHubPrivateUser extends GitHubUserBase {
    private_gists: number;
    total_private_repos: number;
    owned_private_repos: number;
    disk_usage: number;
    collaborators: number;
    two_factor_authentication: boolean;
    plan: {
        collaborators: number;
        name: string;
        space: number;
        private_repos: number;
    };
    business_plus?: boolean;
    ldap_dn?: string;
}

export interface GitHubPublicUser extends GitHubUserBase {
    private_gists?: number;
    total_private_repos?: number;
    owned_private_repos?: number;
    disk_usage?: number;
    collaborators?: number;
}

export type GitHubOAuthUser = GitHubPrivateUser | GitHubPublicUser;

export interface GithubAccessTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
}

export interface GithubAccessTokenRequest {
    client_id: string;
    client_secret: string;
    code: string;
    redirect_uri?: string;
    state?: string;
}

export interface GitHubOAuthError {
    error: string;
    error_description?: string;
    error_uri?: string;
}
