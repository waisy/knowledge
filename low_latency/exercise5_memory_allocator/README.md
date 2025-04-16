# Exercise 5: Custom Memory Allocator

## Objective
Implement a custom memory allocator designed for high-performance trading applications, providing deterministic allocation times and minimizing garbage collection impact.

## Description
Traditional Java memory allocation relies on the garbage collector, which can introduce unpredictable latency spikes during collection cycles. In low-latency trading applications, these pauses can be catastrophic. This exercise challenges you to build a custom memory management system that bypasses Java's garbage collector and provides predictable, low-latency allocation.

## Tasks
1. Implement a basic object pool for reusing objects without garbage collection
2. Create a direct memory allocator using `sun.misc.Unsafe` for off-heap memory access
3. Develop a region-based allocator for short-lived objects with bulk deallocation
4. Build a thread-local allocator optimized for single-thread use
5. Create direct memory buffers for accessing off-heap memory efficiently
6. Benchmark your implementation against standard Java allocation
7. Implement specialized allocators for different object sizes and patterns

## Key Low-Latency Techniques
- Off-heap memory management to avoid garbage collection
- Object pooling to minimize allocation costs
- Region-based allocation for bulk lifecycle management
- Cache-line alignment for optimal memory access patterns
- Thread-local allocation to reduce contention
- Power-of-two size classes for efficient memory utilization

## Sample Code Skeleton

```java
public class DirectMemoryAllocator {
    private static final Unsafe UNSAFE;
    
    static {
        try {
            Field field = Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);
            UNSAFE = (Unsafe) field.get(null);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    private final long baseAddress;
    private final long capacity;
    private final AtomicLong position = new AtomicLong(0);
    
    public DirectMemoryAllocator(long capacityBytes) {
        this.capacity = capacityBytes;
        this.baseAddress = UNSAFE.allocateMemory(capacityBytes);
        // Initialize memory to zero
        UNSAFE.setMemory(baseAddress, capacityBytes, (byte) 0);
    }
    
    public DirectBuffer allocate(int size) {
        // Align size to 8-byte boundary
        int alignedSize = (size + 7) & ~7;
        
        // Allocate memory
        long offset = position.getAndAdd(alignedSize);
        if (offset + alignedSize > capacity) {
            throw new OutOfMemoryError("Capacity exceeded");
        }
        
        return new DirectBuffer(baseAddress + offset, size);
    }
    
    public void free() {
        UNSAFE.freeMemory(baseAddress);
    }
}
```

## Challenge
Extend your memory allocator to implement a size-class allocator with different strategies for small and large allocations. Benchmark its performance against standard Java allocation and demonstrate consistent sub-microsecond allocation times.

## Potential Enhancements with Advanced Memory Management
- Add fragmentation resistance mechanisms
- Implement memory placement optimizations for NUMA architectures
- Create cache-conscious data structure layouts
- Develop memory usage monitoring and leak detection tools
- Build a generational allocator for different object lifetimes 