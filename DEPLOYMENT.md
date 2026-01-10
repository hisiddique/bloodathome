# BloodAtHome - Deployment Guide

Deployment guide for Hostinger shared hosting with SSH access.

## Server Requirements

- PHP 8.2+
- MySQL 5.7+ or MariaDB 10.3+
- Composer 2.x (pre-installed on Hostinger)
- SSH access
- mod_rewrite enabled

## Pre-Deployment Checklist

Before deploying, ensure locally:

1. Run `npm run build` to compile assets
2. Commit the `public/build/` folder
3. Push changes to your repository
4. Compare `.env.example` with production `.env` for any new variables

**Note:** Assets are pre-built and committed. No npm/node required on server.

---

## Initial Setup (First-time deployment)

### 1. SSH into Hostinger

```bash
ssh u123456789@your-server.hostinger.com
```

### 2. Navigate to public_html

```bash
cd ~/public_html
```

### 3. Clone the Repository

```bash
git clone https://github.com/your-username/bloodathome.git .
```

**Note:** The `.` clones directly into public_html without creating a subdirectory.

### 4. Set PHP Version

In Hostinger hPanel:
1. Go to **Advanced** > **PHP Configuration**
2. Set PHP version to **8.2**
3. Enable required extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`

### 5. Install PHP Dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### 6. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update these values:

```env
APP_NAME="BloodAtHome"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Timezone
APP_TIMEZONE=Europe/London

# Shared hosting - no queue support
QUEUE_CONNECTION=sync
```

### 7. Generate Application Key

```bash
php artisan key:generate
```

### 8. Run Database Migrations

```bash
php artisan migrate --force
```

### 9. Set Folder Permissions

```bash
chmod -R 755 storage bootstrap/cache
```

### 10. Create Storage Link

```bash
php artisan storage:link
```

### 11. Cache Configuration (Production)

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Updating (Subsequent deployments)

```bash
cd ~/public_html

# Pull latest changes
git pull origin main

# Install/update dependencies
composer install --no-dev --optimize-autoloader

# Run new migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Before Each Update

Always compare `.env.example` with your production `.env` to check for new environment variables that may have been added.

---

## Folder Structure

After deployment, your folder structure should look like:

```
public_html/
├── .htaccess          <- Blocks sensitive files, routes to public/
├── app/
├── bootstrap/
├── config/
├── database/
├── lang/
├── public/
│   ├── .htaccess      <- Security headers, HTTPS, Laravel routing
│   ├── build/         <- Pre-compiled assets (CSS, JS)
│   ├── index.php      <- Entry point
│   └── assets/        <- Static assets (logo, images)
├── resources/
├── routes/
├── storage/
├── vendor/
├── .env
└── ...
```

---

## Security Features

The `.htaccess` files include:

### Root `.htaccess`
- Blocks access to `.env`, `.git/`, `composer.json`, `artisan`
- Blocks access to `app/`, `config/`, `database/`, `storage/`, `vendor/`
- Routes all valid requests to `public/`

### Public `.htaccess`
- Forces HTTPS redirect
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Blocks source map files
- Asset caching (1 year for CSS/JS/images)
- Gzip compression

---

## Troubleshooting

### 500 Internal Server Error

1. Check `.htaccess` files exist in root and public/
2. Verify PHP version is 8.2+
3. Check `storage/logs/laravel.log` for errors
4. Ensure permissions are correct on storage/

```bash
chmod -R 755 storage bootstrap/cache
```

### CSS/JS Not Loading

1. Verify `public/build/` folder exists and contains assets
2. Check `public/build/manifest.json` exists
3. Clear browser cache
4. Check browser console for HTTPS mixed content errors

### Database Connection Failed

1. Verify database credentials in `.env`
2. Check database exists in Hostinger hPanel
3. Ensure database user has full privileges

### "Class not found" Errors

```bash
composer dump-autoload --optimize
```

### Environment Variable Issues

If you suspect `.env` caching issues:
```bash
php artisan config:clear
php artisan cache:clear
```

### Clear All Caches

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## SSL/HTTPS

Hostinger provides free SSL. The `public/.htaccess` automatically redirects HTTP to HTTPS.

Ensure your `.env` has:
```env
APP_URL=https://yourdomain.com
```

---

## Shared Hosting Limitations

**No Background Queue Workers:** Shared hosting does not support long-running background processes. Set `QUEUE_CONNECTION=sync` in `.env` to process jobs immediately (synchronously).

### Async Processing with Cron Jobs

For async-like behavior on shared hosting, use Laravel's scheduler to process queued jobs:

**Step 1:** Set `QUEUE_CONNECTION=database` in `.env`

**Step 2:** Run the queue table migration:
```bash
php artisan queue:table && php artisan migrate
```

**Step 3:** Add the queue worker to your scheduler in `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule): void
{
    // Process queue jobs every minute (max 55 seconds to avoid overlap)
    $schedule->command('queue:work --stop-when-empty --max-time=55')
             ->everyMinute()
             ->withoutOverlapping()
             ->runInBackground();

    // Add other scheduled tasks here as needed
    // $schedule->command('backup:clean')->daily();
}
```

**Step 4:** Add a single cron job in Hostinger hPanel:
```
* * * * * cd ~/public_html && php artisan schedule:run >> /dev/null 2>&1
```

**Why use schedule:run instead of a separate queue cron?**
- Single cron entry to manage
- Built-in overlap protection via `withoutOverlapping()`
- All scheduling logic is version controlled in your codebase
- Easy to add other scheduled tasks (reports, cleanup, backups, etc.)

**Note:** This is not true background processing but provides async-like behavior for emails, notifications, etc.

---

## Database Backup

Before major updates, backup your database via Hostinger hPanel or SSH:

```bash
mysqldump -u your_user -p your_database > backup_$(date +%Y%m%d).sql
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `composer install --no-dev` | Install PHP dependencies |
| `php artisan migrate --force` | Run database migrations |
| `php artisan config:cache` | Cache configuration |
| `php artisan route:cache` | Cache routes |
| `php artisan view:cache` | Cache views |
| `php artisan cache:clear` | Clear application cache |
| `php artisan config:clear` | Clear config cache |
| `php artisan storage:link` | Create storage symlink |

---

## Support

For issues specific to this application, check `storage/logs/laravel.log`.

For Hostinger-specific issues, contact Hostinger support or check their knowledge base.
