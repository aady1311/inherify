-- ============================================================
-- InHerify MySQL Schema  (run once on your Hostinger DB)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar VARCHAR(500),
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM(
        'active',
        'suspended',
        'pending'
    ) DEFAULT 'pending',
    plan ENUM('free', 'pro', 'legacy') DEFAULT 'free',
    two_factor_enabled TINYINT(1) DEFAULT 0,
    otp_code VARCHAR(10),
    otp_expires_at DATETIME,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

CREATE TABLE IF NOT EXISTS vault_assets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM(
        'passwords',
        'email',
        'bank',
        'crypto',
        'insurance',
        'property',
        'medical',
        'identity',
        'notes',
        'custom'
    ) NOT NULL,
    username VARCHAR(255),
    url VARCHAR(500),
    notes TEXT,
    status ENUM(
        'active',
        'archived',
        'inherited',
        'pending'
    ) DEFAULT 'active',
    favorite TINYINT(1) DEFAULT 0,
    encrypted TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_accessed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vault_documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM(
        'pdf',
        'image',
        'doc',
        'spreadsheet',
        'presentation',
        'other'
    ) DEFAULT 'other',
    size BIGINT DEFAULT 0,
    category ENUM(
        'passwords',
        'email',
        'bank',
        'crypto',
        'insurance',
        'property',
        'medical',
        'identity',
        'notes',
        'custom'
    ) DEFAULT 'other',
    url VARCHAR(500),
    encrypted TINYINT(1) DEFAULT 1,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nominees (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    relation VARCHAR(100),
    avatar VARCHAR(500),
    share_percentage DECIMAL(5, 2) DEFAULT 0,
    verification_status ENUM(
        'verified',
        'pending',
        'rejected',
        'expired'
    ) DEFAULT 'pending',
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_notified_at DATETIME,
    assets_shared INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asset_nominees (
    asset_id VARCHAR(36) NOT NULL,
    nominee_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (asset_id, nominee_id),
    FOREIGN KEY (asset_id) REFERENCES vault_assets (id) ON DELETE CASCADE,
    FOREIGN KEY (nominee_id) REFERENCES nominees (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_nominees (
    document_id VARCHAR(36) NOT NULL,
    nominee_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (document_id, nominee_id),
    FOREIGN KEY (document_id) REFERENCES vault_documents (id) ON DELETE CASCADE,
    FOREIGN KEY (nominee_id) REFERENCES nominees (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM(
        'security',
        'nominee',
        'asset',
        'system',
        'billing',
        'verification'
    ) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    action_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM(
        'login',
        'logout',
        'create',
        'update',
        'delete',
        'share',
        'verify',
        'download',
        'upload'
    ) NOT NULL,
    description TEXT NOT NULL,
    ip VARCHAR(50),
    device VARCHAR(255),
    location VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS digital_wills (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    title VARCHAR(255) DEFAULT 'My Digital Legacy',
    content LONGTEXT,
    status ENUM('draft', 'published') DEFAULT 'draft',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    signed_at DATETIME,
    signature_hash VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS will_versions (
    id VARCHAR(36) PRIMARY KEY,
    will_id VARCHAR(36) NOT NULL,
    version INT NOT NULL,
    content LONGTEXT,
    summary VARCHAR(500),
    updated_by VARCHAR(255),
    published TINYINT(1) DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (will_id) REFERENCES digital_wills (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    relation VARCHAR(100),
    priority INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_requests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    nominee_id VARCHAR(36),
    nominee_name VARCHAR(255),
    type ENUM(
        'identity',
        'death-certificate',
        'legal'
    ) NOT NULL,
    status ENUM(
        'verified',
        'pending',
        'rejected',
        'expired'
    ) DEFAULT 'pending',
    documents INT DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    plan ENUM('free', 'pro', 'legacy') DEFAULT 'free',
    status ENUM('active', 'trial', 'expired') DEFAULT 'trial',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_devices (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    location VARCHAR(255),
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_current TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);