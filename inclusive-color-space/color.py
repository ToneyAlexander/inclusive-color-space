import math
from random import uniform


def select_point_det(r_square: float = 2.) -> tuple[float, float, float]:
    """Uniformly sample from the sphere deterministically"""
    radius = r_square ** (1. / 2)

    phi = uniform(0, 2 * math.pi)
    costheta = uniform(-1, 1)
    n = uniform(0, 1)

    theta = math.acos(costheta)
    r = radius * (n ** (1.0 / 3))

    t = r * math.sin(theta) * math.cos(phi)
    u = r * math.sin(theta) * math.sin(phi)
    v = r * math.cos(theta)

    return (t, u, v)

def select_point_rnd(r_square: float = 2.) -> tuple[float, float, float]:
    """Uniformly sample from the sphere using rejection sampling"""
    radius = r_square ** (1. / 2)
    R = radius + 1

    while R > radius:
        t = uniform(-radius, radius)
        u = uniform(-radius, radius)
        v = uniform(-radius, radius)

        R = (t**2 + u**2 + v**2) ** (1.0 / 2)

    return (t, u, v)

def tuv_to_rgb(t, u, v) -> tuple[int, int, int]:
    x = (t - 0.15) / 0.45
    y = (v - 1.2 * t ** 2 + 0.2 * t + 0.655) / 1.84
    z = u / 3.6

    r = 28.77438370854 * x + 36.78307445559 * y - 19.69766918644 * z + 187.1436241611
    g = 35.38327306318 * x - 2.009931981182 * y + 47.93462563172 * z + 137.1073825503
    b = 36.14733717939 * x - 43.54346996173 * y - 28.50821294135 * z + 108.2241610738

    return int(r), int(g), int(b)

def rgb_tuple_hex(rgb: tuple[int, int, int]) -> str:
    return '#' + ''.join(f'{h:02X}' for h in rgb)