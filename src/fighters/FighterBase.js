export class FighterBase {
  constructor({ data, x, y, facing }) {
    this.id = data.id;
    this.name = data.name;
    this.era = data.era;
    this.visuals = data.visuals;
    this.specialMove = data.specialMove;
    this.maxHp = data.stats.hp;
    this.hp = data.stats.hp;
    this.speed = data.stats.speed;
    this.power = data.stats.power;

    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 145;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing; // 1 = kanan, -1 = kiri

    this.state = 'idle'; // idle, walk, attack, special, block, ko
    this.attackFrame = 0;
    this.attackCooldown = 0;
    this.specialCooldown = 0;
    this.maxSpecialCooldown = 180; // 3 detik pada 60 FPS
    this.hasHitThisSwing = false;
    this.xrayTimer = 0;
  }

  update(groundY, canvasWidth, opponent) {
    if (this.xrayTimer > 0) this.xrayTimer--;

    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'ko';
      return;
    }

    // Hadap lawan otomatis jika di tanah dan tidak sedang menyerang
    if (this.y + this.height >= groundY && this.state !== 'attack' && this.state !== 'special') {
      this.facing = opponent.x >= this.x ? 1 : -1;
    }

    // Gravitasi
    this.vy += 0.85;
    this.x += this.vx;
    this.y += this.vy;

    // Lantai arena
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
    }

    // Batas dinding kiri & kanan
    if (this.x < 30) this.x = 30;
    if (this.x + this.width > canvasWidth - 30) this.x = canvasWidth - 30 - this.width;

    // Durasi animasi serangan dasar & spesial
    if (this.state === 'attack' || this.state === 'special') {
      this.attackFrame++;
      if (this.attackFrame > 16) {
        this.state = 'idle';
        this.attackFrame = 0;
        this.hasHitThisSwing = false;
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.specialCooldown > 0) this.specialCooldown--;
  }

  attack() {
    if (this.attackCooldown === 0 && this.state !== 'attack' && this.state !== 'special' && this.state !== 'ko') {
      this.state = 'attack';
      this.attackFrame = 0;
      this.attackCooldown = 22;
      this.hasHitThisSwing = false;
    }
  }

  castSpecial() {
    if (this.specialCooldown === 0 && this.state !== 'ko' && this.state !== 'special') {
      this.state = 'special';
      this.attackFrame = 0;
      this.specialCooldown = this.maxSpecialCooldown;
      return {
        ownerId: this.id,
        name: this.specialMove.name,
        x: this.facing === 1 ? this.x + this.width + 10 : this.x - 45,
        y: this.y + 42,
        width: 38,
        height: 28,
        vx: this.facing * 12,
        damage: this.specialMove.damage,
        color: this.visuals.rimColor,
        facing: this.facing,
      };
    }
    return null;
  }

  getHitbox() {
    if (this.state !== 'attack' || this.attackFrame < 4 || this.attackFrame > 10) return null;
    return {
      x: this.facing === 1 ? this.x + this.width : this.x - 55,
      y: this.y + 40,
      width: 55,
      height: 30,
    };
  }

  takeDamage(amount, triggerXray = false) {
    if (this.state === 'ko') return 0;
    const isBlocking = this.state === 'block';
    const finalDamage = isBlocking ? Math.floor(amount * 0.2) : amount;
    this.hp = Math.max(0, this.hp - finalDamage);

    // Picu efek X-Ray jika terkena jurus telak (tidak diblok) atau pukulan penghabisan KO
    if ((!isBlocking && triggerXray) || this.hp === 0) {
      this.xrayTimer = 28;
    }
    return finalDamage;
  }
}