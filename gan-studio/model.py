import torch
import torch.nn as nn

CLASSES = [
    "cake",
    "balloons",
    "gifts",
    "flowers",
    "fireworks",
    "galaxy",
    "forest",
    "castle",
]

LATENT_DIM = 100
EMBED_DIM = 32
IMG_SIZE = 128


class Generator(nn.Module):
    """Conditional DCGAN Generator producing 3x128x128 RGB birthday artwork."""

    def __init__(self, num_classes: int = len(CLASSES), latent_dim: int = LATENT_DIM, embed_dim: int = EMBED_DIM):
        super().__init__()
        self.label_emb = nn.Embedding(num_classes, embed_dim)
        in_dim = latent_dim + embed_dim

        self.net = nn.Sequential(
            # 1x1 -> 4x4
            nn.ConvTranspose2d(in_dim, 512, kernel_size=4, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(512),
            nn.ReLU(True),
            # 4x4 -> 8x8
            nn.ConvTranspose2d(512, 256, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(True),
            # 8x8 -> 16x16
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            # 16x16 -> 32x32
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(True),
            # 32x32 -> 64x64
            nn.ConvTranspose2d(64, 32, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(True),
            # 64x64 -> 128x128
            nn.ConvTranspose2d(32, 3, kernel_size=4, stride=2, padding=1, bias=False),
            nn.Tanh(),
        )

    def forward(self, z: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
        emb = self.label_emb(labels)
        x = torch.cat([z, emb], dim=1).unsqueeze(-1).unsqueeze(-1)
        return self.net(x)


class Discriminator(nn.Module):
    """Conditional DCGAN Discriminator evaluating 3x128x128 RGB images."""

    def __init__(self, num_classes: int = len(CLASSES)):
        super().__init__()
        self.label_emb = nn.Embedding(num_classes, IMG_SIZE * IMG_SIZE)

        self.net = nn.Sequential(
            # 4x128x128 -> 32x64x64
            nn.Conv2d(4, 32, kernel_size=4, stride=2, padding=1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            # 64x64 -> 32x32
            nn.Conv2d(32, 64, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),
            # 32x32 -> 16x16
            nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            # 16x16 -> 8x8
            nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            # 8x8 -> 4x4
            nn.Conv2d(256, 512, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
            # 4x4 -> 1x1
            nn.Conv2d(512, 1, kernel_size=4, stride=1, padding=0, bias=False),
        )

    def forward(self, img: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
        cond = self.label_emb(labels).view(-1, 1, IMG_SIZE, IMG_SIZE)
        x = torch.cat([img, cond], dim=1)
        return self.net(x).view(-1)


def prompt_to_class_idx(prompt: str) -> int:
    p = prompt.lower()
    mapping = {
        "cake": ["cake", "candle", "frosting", "cupcake", "dessert"],
        "balloons": ["balloon", "confetti", "party", "streamer", "hat"],
        "gifts": ["gift", "present", "box", "ribbon", "bow"],
        "flowers": ["flower", "floral", "rose", "bloom", "peony", "watercolor"],
        "fireworks": ["firework", "spark", "neon", "gaming", "celebration"],
        "galaxy": ["galaxy", "star", "space", "night", "moon", "cosmic"],
        "forest": ["forest", "tree", "nature", "magic", "fairy"],
        "castle": ["castle", "princess", "kingdom", "palace", "crown"],
    }
    for idx, cls_name in enumerate(CLASSES):
        if any(k in p for k in mapping[cls_name]):
            return idx
    return 0
