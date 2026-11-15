import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from model import CLASSES, LATENT_DIM, IMG_SIZE, Generator, Discriminator

BASE_DIR = os.path.dirname(__file__)
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
WEIGHTS_DIR = os.path.join(BASE_DIR, "weights")
WEIGHTS_PATH = os.path.join(WEIGHTS_DIR, "birthday_cgan.pth")


def train(epochs: int = 25, batch_size: int = 32, lr: float = 0.0002):
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
    ])

    dataset = datasets.ImageFolder(DATASET_DIR, transform=transform)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, num_workers=0)

    netG = Generator(num_classes=len(CLASSES)).to(device)
    netD = Discriminator(num_classes=len(CLASSES)).to(device)

    criterion = nn.BCEWithLogitsLoss()
    optG = torch.optim.Adam(netG.parameters(), lr=lr, betas=(0.5, 0.999))
    optD = torch.optim.Adam(netD.parameters(), lr=lr, betas=(0.5, 0.999))

    print(f"Training Conditional DCGAN on {device} with {len(dataset)} images for {epochs} epochs...")

    for epoch in range(1, epochs + 1):
        g_loss_sum = 0.0
        d_loss_sum = 0.0
        steps = 0

        for real_imgs, labels in loader:
            real_imgs = real_imgs.to(device)
            labels = labels.to(device)
            bs = real_imgs.size(0)

            real_targets = torch.full((bs,), 0.9, device=device)
            fake_targets = torch.zeros(bs, device=device)

            # Train Discriminator
            optD.zero_grad()
            out_real = netD(real_imgs, labels)
            loss_real = criterion(out_real, real_targets)

            z = torch.randn(bs, LATENT_DIM, device=device)
            fake_imgs = netG(z, labels)
            out_fake = netD(fake_imgs.detach(), labels)
            loss_fake = criterion(out_fake, fake_targets)

            lossD = loss_real + loss_fake
            lossD.backward()
            optD.step()

            # Train Generator
            optG.zero_grad()
            out_g = netD(fake_imgs, labels)
            lossG = criterion(out_g, torch.ones(bs, device=device))
            lossG.backward()
            optG.step()

            g_loss_sum += lossG.item()
            d_loss_sum += lossD.item()
            steps += 1

        if epoch == 1 or epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch [{epoch}/{epochs}] D_loss={d_loss_sum/steps:.4f} G_loss={g_loss_sum/steps:.4f}")

    torch.save({
        "state_dict": netG.state_dict(),
        "classes": dataset.classes,
        "latent_dim": LATENT_DIM,
        "img_size": IMG_SIZE,
    }, WEIGHTS_PATH)
    print(f"Saved trained GAN weights to {WEIGHTS_PATH}")


if __name__ == "__main__":
    train()
