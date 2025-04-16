# Exercise 5: Custom Memory Allocator - Detailed Guide

## Introduction

In this exercise, you will implement a custom memory allocator designed for high-performance, low-latency applications. The allocator will provide deterministic allocation times, minimize garbage collection pauses, and optimize memory access patterns for cache efficiency.

## Learning Objectives

- Implement a custom memory management system that bypasses Java's garbage collector
- Design allocation strategies optimized for different use cases
- Create specialized memory pools for common object types
- Understand the performance implications of memory layout and access patterns
- Measure and optimize memory allocation latency

## Background

Java's automatic memory management through garbage collection can introduce unpredictable latency spikes, which are unacceptable in high-performance trading systems. Custom memory allocators can provide:

- Predictable, low-latency allocation times
- Reduced garbage collection pressure
- Improved cache locality through better memory layout
- Specialized allocation strategies for different object lifetimes
- Better control over memory fragmentation

## Requirements

Your implementation should:
1. Provide sub-microsecond allocation times with minimal jitter
2. Support different allocation patterns (e.g., object pooling, region-based allocation)
3. Include mechanisms for memory reuse to minimize garbage collection
4. Implement specialized allocators for different object types and sizes
5. Include comprehensive benchmarks comparing performance to standard Java allocation
6. Support thread-safe and thread-local allocation strategies

## Implementation Steps

### 1. Set Up the Project Structure

```java
src/main/java/com/lowlatency/memory/
├── allocator/
│   ├── MemoryAllocator.java
│   ├── PooledAllocator.java
│   ├── RegionAllocator.java
│   └── StackAllocator.java
├── buffer/
│   ├── DirectBuffer.java
│   ├── MappedBuffer.java
│   └── UnsafeBuffer.java
├── pool/
│   ├── ObjectPool.java
│   ├── TypedObjectPool.java
│   └── GenericObjectPool.java
├── util/
│   ├── UnsafeMemory.java
│   ├── MemoryUtils.java
│   └── Recyclable.java
├── benchmark/
│   └── AllocatorBenchmark.java
└── Main.java
```

### 2. Implement a Basic Object Pool

Create a reusable object pool to minimize allocations:

```java
public class ObjectPool<T> {
    private final T[] objects;
    private final AtomicInteger index = new AtomicInteger(0);
    private final Supplier<T> factory;
    private final Consumer<T> reset;
    
    public ObjectPool(int size, Supplier<T> factory, Consumer<T> reset) {
        this.factory = factory;
        this.reset = reset;
        
        @SuppressWarnings("unchecked")
        T[] temp = (T[]) new Object[size];
        objects = temp;
        
        for (int i = 0; i < size; i++) {
            objects[i] = factory.get();
        }
    }
    
    public T acquire() {
        int currentIndex;
        int nextIndex;
        do {
            currentIndex = index.get();
            if (currentIndex >= objects.length) {
                // Pool is exhausted, create a new instance
                return factory.get();
            }
            nextIndex = currentIndex + 1;
        } while (!index.compareAndSet(currentIndex, nextIndex));
        
        return objects[currentIndex];
    }
    
    public void release(T object) {
        reset.accept(object);
        int currentIndex = index.decrementAndGet();
        if (currentIndex >= 0 && currentIndex < objects.length) {
            objects[currentIndex] = object;
        }
    }
}
```

### 3. Create a Direct Memory Allocator

Implement an allocator using off-heap memory:

```java
public class DirectMemoryAllocator implements MemoryAllocator {
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
        if (size <= 0) {
            throw new IllegalArgumentException("Size must be positive");
        }
        
        // Align size to 8-byte boundary
        int alignedSize = (size + 7) & ~7;
        
        // Allocate memory
        long offset = position.getAndAdd(alignedSize);
        if (offset + alignedSize > capacity) {
            throw new OutOfMemoryError("DirectMemoryAllocator capacity exceeded");
        }
        
        return new DirectBuffer(baseAddress + offset, size);
    }
    
    public void free() {
        // Free all memory at once
        UNSAFE.freeMemory(baseAddress);
    }
}
```

### 4. Implement a Region-Based Allocator

Create an allocator for short-lived objects with bulk deallocation:

```java
public class RegionAllocator implements MemoryAllocator {
    private final long regionSize;
    private final List<Region> regions = new ArrayList<>();
    private Region currentRegion;
    
    public RegionAllocator(long regionSizeBytes) {
        this.regionSize = regionSizeBytes;
        this.currentRegion = new Region(regionSize);
        regions.add(currentRegion);
    }
    
    public DirectBuffer allocate(int size) {
        if (size > regionSize) {
            throw new IllegalArgumentException("Allocation size exceeds region size");
        }
        
        // Try to allocate from current region
        DirectBuffer buffer = currentRegion.allocate(size);
        if (buffer == null) {
            // Current region is full, create a new one
            currentRegion = new Region(regionSize);
            regions.add(currentRegion);
            buffer = currentRegion.allocate(size);
        }
        
        return buffer;
    }
    
    public void reset() {
        // Reset all regions
        for (Region region : regions) {
            region.reset();
        }
        currentRegion = regions.get(0);
    }
    
    private static class Region {
        private final long baseAddress;
        private final long capacity;
        private long position = 0;
        
        public Region(long capacityBytes) {
            this.capacity = capacityBytes;
            this.baseAddress = UNSAFE.allocateMemory(capacityBytes);
            UNSAFE.setMemory(baseAddress, capacityBytes, (byte) 0);
        }
        
        public DirectBuffer allocate(int size) {
            // Align size to 8-byte boundary
            int alignedSize = (size + 7) & ~7;
            
            if (position + alignedSize > capacity) {
                return null; // Region is full
            }
            
            long offset = position;
            position += alignedSize;
            
            return new DirectBuffer(baseAddress + offset, size);
        }
        
        public void reset() {
            position = 0;
        }
    }
}
```

### 5. Create a Thread-Local Allocator

Implement an allocator optimized for single-thread use:

```java
public class ThreadLocalAllocator {
    private static final ThreadLocal<MemoryAllocator> allocators = 
        ThreadLocal.withInitial(() -> new DirectMemoryAllocator(1024 * 1024));
    
    public static DirectBuffer allocate(int size) {
        return allocators.get().allocate(size);
    }
    
    public static void reset() {
        // Reset the current thread's allocator
        if (allocators.get() instanceof RegionAllocator) {
            ((RegionAllocator) allocators.get()).reset();
        }
    }
}
```

### 6. Create a Direct Memory Buffer

Implement a buffer for accessing off-heap memory:

```java
public class DirectBuffer {
    private final long address;
    private final int capacity;
    
    public DirectBuffer(long address, int capacity) {
        this.address = address;
        this.capacity = capacity;
    }
    
    public long getLong(int index) {
        checkBounds(index, Long.BYTES);
        return UNSAFE.getLong(address + index);
    }
    
    public void putLong(int index, long value) {
        checkBounds(index, Long.BYTES);
        UNSAFE.putLong(address + index, value);
    }
    
    public int getInt(int index) {
        checkBounds(index, Integer.BYTES);
        return UNSAFE.getInt(address + index);
    }
    
    public void putInt(int index, int value) {
        checkBounds(index, Integer.BYTES);
        UNSAFE.putInt(address + index, value);
    }
    
    private void checkBounds(int index, int typeSize) {
        if (index < 0 || index + typeSize > capacity) {
            throw new IndexOutOfBoundsException();
        }
    }
}
```

### 7. Benchmark Your Implementation

Create benchmarks to validate performance:

```java
public class AllocatorBenchmark {
    private static final int ITERATIONS = 1_000_000;
    private static final int OBJECT_SIZE = 64;
    
    public void benchmarkStandardAllocation() {
        long start = System.nanoTime();
        
        for (int i = 0; i < ITERATIONS; i++) {
            byte[] data = new byte[OBJECT_SIZE];
            // Do something with data to prevent JIT optimizations
            data[0] = (byte) i;
        }
        
        long end = System.nanoTime();
        System.out.println("Standard allocation: " + (end - start) / ITERATIONS + " ns per allocation");
    }
    
    public void benchmarkDirectAllocation() {
        DirectMemoryAllocator allocator = new DirectMemoryAllocator(ITERATIONS * OBJECT_SIZE);
        
        long start = System.nanoTime();
        
        for (int i = 0; i < ITERATIONS; i++) {
            DirectBuffer buffer = allocator.allocate(OBJECT_SIZE);
            // Do something with buffer
            buffer.putByte(0, (byte) i);
        }
        
        long end = System.nanoTime();
        System.out.println("Direct allocation: " + (end - start) / ITERATIONS + " ns per allocation");
        
        allocator.free();
    }
    
    public void benchmarkPooledAllocation() {
        ObjectPool<byte[]> pool = new ObjectPool<>(
            ITERATIONS,
            () -> new byte[OBJECT_SIZE],
            array -> Arrays.fill(array, (byte) 0)
        );
        
        long start = System.nanoTime();
        
        for (int i = 0; i < ITERATIONS; i++) {
            byte[] data = pool.acquire();
            // Do something with data
            data[0] = (byte) i;
            pool.release(data);
        }
        
        long end = System.nanoTime();
        System.out.println("Pooled allocation: " + (end - start) / ITERATIONS + " ns per allocation");
    }
}
```

## Advanced Techniques

### 1. Size-Specific Allocators

Create specialized allocators for different object sizes:

```java
public class SizeClassAllocator implements MemoryAllocator {
    private final MemoryAllocator[] sizeClassAllocators;
    private final int[] sizeClasses;
    
    public SizeClassAllocator() {
        // Define power-of-two size classes (16, 32, 64, 128, 256, 512, 1024)
        sizeClasses = new int[7];
        for (int i = 0; i < sizeClasses.length; i++) {
            sizeClasses[i] = 16 << i;
        }
        
        sizeClassAllocators = new MemoryAllocator[sizeClasses.length];
        for (int i = 0; i < sizeClassAllocators.length; i++) {
            sizeClassAllocators[i] = new PooledAllocator(sizeClasses[i], 1024);
        }
    }
    
    public DirectBuffer allocate(int size) {
        // Find appropriate size class
        for (int i = 0; i < sizeClasses.length; i++) {
            if (size <= sizeClasses[i]) {
                return sizeClassAllocators[i].allocate(sizeClasses[i]);
            }
        }
        
        // Fallback for larger allocations
        return new DirectMemoryAllocator(size).allocate(size);
    }
}
```

### 2. Memory-Mapped Files

Use memory-mapped files for large, persistent allocations:

```java
public class MappedAllocator implements MemoryAllocator {
    private final FileChannel channel;
    private final MappedByteBuffer buffer;
    private final AtomicLong position = new AtomicLong(0);
    
    public MappedAllocator(String filename, long capacityBytes) throws IOException {
        File file = new File(filename);
        channel = new RandomAccessFile(file, "rw").getChannel();
        buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, capacityBytes);
    }
    
    public ByteBuffer allocate(int size) {
        long offset = position.getAndAdd(size);
        
        if (offset + size > buffer.capacity()) {
            throw new OutOfMemoryError("Mapped region capacity exceeded");
        }
        
        buffer.position((int) offset);
        ByteBuffer slice = buffer.slice();
        slice.limit(size);
        
        return slice;
    }
    
    public void close() throws IOException {
        channel.close();
    }
}
```

### 3. Cache-Aligned Allocations

Optimize for cache line efficiency:

```java
public class CacheAlignedAllocator implements MemoryAllocator {
    private static final int CACHE_LINE_SIZE = 64;
    private final MemoryAllocator delegate;
    
    public CacheAlignedAllocator(MemoryAllocator delegate) {
        this.delegate = delegate;
    }
    
    public DirectBuffer allocate(int size) {
        // Round up size to multiple of cache line size
        int alignedSize = (size + CACHE_LINE_SIZE - 1) & ~(CACHE_LINE_SIZE - 1);
        return delegate.allocate(alignedSize);
    }
}
```

## Challenges

1. **Fragmentation Resistance**: Implement a memory allocator resistant to fragmentation
2. **Generational Allocator**: Create a generational allocator for different object lifetimes
3. **Compressed Objects**: Implement memory-efficient object representation for small objects
4. **Thread-Safe Pool**: Create a lock-free object pool for concurrent access
5. **Memory Monitoring**: Add tools to track allocation patterns and detect leaks

## Testing and Verification

Verify your implementation with these tests:
1. Allocation performance under various patterns (small/large objects, frequent/infrequent)
2. Memory usage efficiency compared to standard Java allocation
3. Latency distribution (mean, median, 99th percentile)
4. Behavior under memory pressure
5. Long-running stability tests to detect memory leaks

## Additional Resources

- [Unsafe](https://github.com/LWJGL/lwjgl3/blob/master/modules/core/src/main/java/org/lwjgl/system/MemoryUtil.java) - Example of Unsafe usage in LWJGL
- [Chronicle Core](https://github.com/OpenHFT/Chronicle-Core) - Low-level memory access library
- [Real Logic Agrona](https://github.com/real-logic/agrona) - High-performance primitives and utilities
- [JEmalloc](https://jemalloc.net/) - General purpose malloc implementation (for reference)
- [TCMalloc](https://github.com/google/tcmalloc) - Thread-caching malloc (for reference)

## Expected Outcome

By completing this exercise, you will gain practical experience in:
- Implementing custom memory management strategies for low-latency applications
- Understanding the performance characteristics of different memory allocation approaches
- Measuring and optimizing allocation performance
- Creating thread-safe memory management utilities
- Managing off-heap memory in Java applications

The resulting memory allocator will provide predictable, low-latency allocation suitable for high-frequency trading systems, avoiding the uncertainty introduced by the standard Java garbage collector. 