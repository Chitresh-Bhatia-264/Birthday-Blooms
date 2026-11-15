import base64
import io
import os
import sys
import torch
from PIL import Image, ImageFilter
from model import CLASSES, LATENT_DIM, Generator, prompt_to_class_idx

BASE_DIR = os.path.dirname(__file__)
WEIGHTS_PATH = os.path.join(BASE_DIR, "weights", "birthday_cgan.pth")


def generate_base64(prompt: str) -> str:
    if not os.path.exists(WEIGHTS_PATH):
        raise FileNotFoundError(f"GAN weights not found at {WEIGHTS_PATH}")

    checkpoint = torch.load(WEIGHTS_PATH, map_location="cpu", weights_only=True)
    classes = checkpoint.get("classes", CLASSES)
    latent_dim = int(checkpoint.get("latent_dim", LATENT_DIM))

    netG = Generator(num_classes=len(classes), latent_dim=latent_dim)
    netG.load_state_dict(checkpoint["state_dict"])
    netG.eval()

    cls_idx = prompt_to_class_idx(prompt)
    cls_name = CLASSES[cls_idx]
    if cls_name in classes:
        cls_idx = classes.index(cls_name)

    with torch.no_grad():
        z = torch.randn(1, latent_dim)
        label = torch.tensor([cls_idx], dtype=torch.long)
        tensor = netG(z, label).squeeze(0).clamp(-1, 1)
        tensor = ((tensor + 1.0) * 127.5).byte().permute(1, 2, 0).numpy()

    img = Image.fromarray(tensor, mode="RGB")
    img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=3))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


if __name__ == "__main__":
    user_prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "birthday cake"
    print(generate_base64(user_prompt))
