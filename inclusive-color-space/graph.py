from __future__ import annotations

from colorsys import hls_to_rgb, hsv_to_rgb, rgb_to_hls, rgb_to_hsv
from math import ceil, sqrt

import matplotlib.pyplot as plt
from color import rgb_tuple_hex, tuv_to_rgb
from matplotlib.axes import Axes
from mpl_toolkits.mplot3d import Axes3D
from pydantic import BaseModel


class GraphData(BaseModel):
    def plot(self, axes: Axes):
        raise NotImplementedError()


class GraphData3D(BaseModel):
    dataset: list[tuple] = []

    colors: list | None = None

    def convert_dataset(self) -> tuple:
        return zip(*self.dataset)

    def plot(self, axes: Axes3D):
        axes.scatter(*zip(*self.dataset), c=self.colors)


class TUVGraph(GraphData3D):
    def plot(self, axes: Axes3D):
        axes.set_aspect("equal")
        axes.scatter(
            *zip(*self.dataset),
            c=[rgb_tuple_hex(tuv_to_rgb(*d)) for d in self.dataset],
        )


class RGBGraph(GraphData3D):
    def plot(self, axes: Axes3D):
        axes.set_aspect("equal")
        axes.scatter(
            *zip(*self.dataset),
            c=[rgb_tuple_hex(d) for d in self.dataset],
        )

    @classmethod
    def from_tuv(cls, graph: TUVGraph) -> RGBGraph:
        return cls(dataset=[tuv_to_rgb(*d) for d in graph.dataset])


class HSVGraph(GraphData3D):
    rotated: float = 0.0

    def unrotate(self, hsv: tuple[float, float, float]) -> tuple[float, float, float]:
        h, s, v = hsv
        h = (h + 1 - self.rotated) % 1
        return h, s, v

    def plot(self, axes: Axes3D):
        axes.set_aspect("equal")
        axes.scatter(
            *zip(*self.dataset),
            c=[
                rgb_tuple_hex(int(x * 255) for x in hsv_to_rgb(*self.unrotate(d)))
                for d in self.dataset
            ],
        )

    @classmethod
    def from_rgb(cls, graph: RGBGraph) -> HSVGraph:
        dataset = []
        for d in graph.dataset:
            h, s, v = rgb_to_hsv(*[x / 255.0 for x in d])
            h = (h + 0.5) % 1
            dataset.append((h, s, v))

        return cls(dataset=dataset, rotated=0.5)


class HLSGraph(GraphData3D):
    rotated: float = 0.0

    def unrotate(self, hls: tuple[float, float, float]) -> tuple[float, float, float]:
        h, l, s = hls
        h = (h + 1 - self.rotated) % 1
        return h, l, s

    def plot(self, axes: Axes3D):
        axes.set_aspect("equal")
        axes.scatter(
            *zip(*self.dataset),
            c=[
                rgb_tuple_hex(int(x * 255) for x in hls_to_rgb(*self.unrotate(d)))
                for d in self.dataset
            ],
        )

    @classmethod
    def from_rgb(cls, graph: RGBGraph) -> HLSGraph:
        dataset = []
        for d in graph.dataset:
            h, l, s = rgb_to_hls(*[x / 255.0 for x in d])
            h = (h + 0.5) % 1
            dataset.append((h, l, s))

        return cls(dataset=dataset, rotated=0.5)


def display_graphs(graphs: list[GraphData], cols=4):
    """Take a list of GraphData objects and display them"""
    fig = plt.figure()

    if len(graphs) <= 6:
        fig.set_size_inches(12, 8)

    cols = min(cols, len(graphs))
    rows = ceil(len(graphs) / float(cols))

    for i, graph in enumerate(graphs):
        if isinstance(graph, GraphData3D):
            subplot = fig.add_subplot(rows, cols, i + 1, projection="3d")
            graph.plot(subplot)
        else:
            subplot = fig.add_subplot(rows, cols, i + 1)
            graph.plot(subplot)

    plt.show()


def tuv_surface(
    r_squared: float, scale: float = 100.0, resolution: int = 2
) -> TUVGraph:
    r = int(sqrt(r_squared) * scale)
    r_sq = r**2

    dataset = []
    for t in range(-r, r):
        for u in range(-r, r):
            for v in range(-r, r):
                if abs(t**2 + u**2 + v**2 - r_sq) < resolution:
                    dataset.append((t / scale, u / scale, v / scale))
    return TUVGraph(dataset=dataset)


def build_comparison_row(r_squared: float) -> list[GraphData]:
    tuv = tuv_surface(r_squared)
    rgb = RGBGraph.from_tuv(tuv)
    hsv = HSVGraph.from_rgb(rgb)
    hls = HLSGraph.from_rgb(rgb)

    return [tuv, rgb, hsv, hls]


if __name__ == "__main__":
    # Show the color space at different R^2 values mapped to various color spaces
    graphs = []
    graphs.extend(build_comparison_row(1.0))
    graphs.extend(build_comparison_row(1.5))
    graphs.extend(build_comparison_row(2.0))

    display_graphs(graphs)
